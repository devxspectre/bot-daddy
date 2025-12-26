import { Pool } from 'pg';
import 'dotenv/config';

// Default to user's Docker PostgreSQL setup
const DATABASE_URL = process.env.DATABASE_URL??''

// Handle SSL for cloud providers (Aiven, Neon, etc.)
// We strip sslmode=require from the URL because it enforces strict validation by default in pg,
// but we want to allow self-signed certs (or missing CAs) by setting rejectUnauthorized: false.
const connectionString = DATABASE_URL.replace('?sslmode=require', '').replace('&sslmode=require', '');
const isSSL = DATABASE_URL.includes('sslmode=require');

const pool = new Pool({
  connectionString,
  ssl: isSSL ? { rejectUnauthorized: false } : undefined,
});

// Initialize pgvector extension and create tables
export async function initDatabase() {
  const client = await pool.connect();
  try {
    // Enable pgvector extension
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');
    
    // Create users table with cuid column
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        cuid VARCHAR(25) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Migration: Add cuid column if it doesn't exist (for existing tables)
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS cuid VARCHAR(25) UNIQUE
    `).catch(() => {
      console.log('Note: cuid column already exists');
    });
    
    // Migration: Add is_verified column if it doesn't exist
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE
    `).catch(() => {
      console.log('Note: is_verified column already exists');
    });
    
    // Create email_verifications table for OTP storage
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create documents table for storing PDF chunks with embeddings
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        chunk_index INTEGER NOT NULL,
        content TEXT NOT NULL,
        embedding vector(1024),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Migration: Update embedding column dimension to 1024 if it exists as 768
    try {
      await client.query(`ALTER TABLE documents ALTER COLUMN embedding TYPE vector(1024)`);
    } catch (e) {
      console.log('Note: Could not alter embedding column dimensions (might match already or have data conflict)');
    }

    // Create chatbots table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chatbots (
        id SERIAL PRIMARY KEY,
        public_id VARCHAR(25) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(7) NOT NULL DEFAULT '#000000',
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create chatbot_documents table (Many-to-Many)
    await client.query(`
      CREATE TABLE IF NOT EXISTS chatbot_documents (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(chatbot_id, filename)
      )
    `);
    
    // Index for faster lookups
     await client.query(`
       CREATE INDEX IF NOT EXISTS chatbot_documents_chatbot_id_idx ON chatbot_documents(chatbot_id)
     `).catch(() => {});

    // Migration: Add status column to chatbots if it doesn't exist
    await client.query(`
      ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'active'
    `).catch(() => {
        console.log('Note: status column already exists');
    });
    
    // Migration: Add user_id column if it doesn't exist (for existing tables)
    await client.query(`
      ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    `).catch(() => {
      console.log('Note: user_id column already exists or could not be added');
    });
    
    // Create index for similarity search (only if table has data)
    await client.query(`
      CREATE INDEX IF NOT EXISTS documents_embedding_idx 
      ON documents USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `).catch(() => {
      // IVFFlat index requires data, will be created later
      console.log('Note: IVFFlat index will be created after data is inserted');
    });
    
    // Create index on user_id for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents(user_id)
    `).catch(() => {
      console.log('Note: user_id index could not be created');
    });
    
    // Migration: Add file_size column if it doesn't exist
    await client.query(`
      ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size INTEGER
    `).catch(() => {
        console.log('Note: file_size column already exists');
    });

    // Create api_keys table for API key authentication
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        key_prefix VARCHAR(12) NOT NULL,
        key_hash VARCHAR(64) NOT NULL,
        plan VARCHAR(50) DEFAULT 'free',
        rate_limit INTEGER DEFAULT 100,
        last_used_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Migration: Drop name column if it exists (no longer needed)
    await client.query(`
      ALTER TABLE api_keys DROP COLUMN IF EXISTS name
    `).catch(() => {
      console.log('Note: name column does not exist or could not be dropped');
    });

    // Index for faster API key lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON api_keys(key_hash)
    `).catch(() => {});

    await client.query(`
      CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys(user_id)
    `).catch(() => {});

    // Create chat_sessions table for tracking conversation sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(36) UNIQUE NOT NULL,
        chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
        started_at TIMESTAMP DEFAULT NOW(),
        ended_at TIMESTAMP,
        message_count INTEGER DEFAULT 0
      )
    `);

    // Create chat_messages table for storing conversation history
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(36) REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
        chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
        user_message TEXT NOT NULL,
        bot_response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Indexes for analytics queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS chat_sessions_chatbot_id_idx ON chat_sessions(chatbot_id)
    `).catch(() => {});

    await client.query(`
      CREATE INDEX IF NOT EXISTS chat_sessions_started_at_idx ON chat_sessions(started_at)
    `).catch(() => {});

    await client.query(`
      CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages(session_id)
    `).catch(() => {});

    await client.query(`
      CREATE INDEX IF NOT EXISTS chat_messages_chatbot_id_idx ON chat_messages(chatbot_id)
    `).catch(() => {});

    await client.query(`
      CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at)
    `).catch(() => {});

    console.log('Database initialized successfully');
  } finally {
    client.release();
  }
}

// Insert a document chunk with its embedding (userId is required)
export async function insertDocumentChunk(
  filename: string,
  chunkIndex: number,
  content: string,
  embedding: number[],
  userId: number,
  fileSize?: number
) {
  const result = await pool.query(
    `INSERT INTO documents (user_id, filename, chunk_index, content, embedding, file_size) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING id`,
    [userId, filename, chunkIndex, content, JSON.stringify(embedding), fileSize || 0]
  );
  return result.rows[0].id;
}

// Search for similar documents using cosine similarity (userId is required)
export async function searchSimilarDocuments(
  queryEmbedding: number[],
  userId: number,
  limit: number = 5
) {
  const result = await pool.query(
    `SELECT id, filename, chunk_index, content, 
            1 - (embedding <=> $1) as similarity
     FROM documents
     WHERE user_id = $2
     ORDER BY embedding <=> $1
     LIMIT $3`,
    [JSON.stringify(queryEmbedding), userId, limit]
  );
  return result.rows;
}

// Get user by CUID
export async function getUserByCuid(cuid: string) {
  const result = await pool.query(
    'SELECT id, cuid, email, name, is_verified FROM users WHERE cuid = $1',
    [cuid]
  );
  return result.rows[0] || null;
}

// Create a new chatbot
export async function insertChatbot(
  userId: number,
  publicId: string,
  name: string,
  color: string
) {
  const result = await pool.query(
    `INSERT INTO chatbots (user_id, public_id, name, color, status)
     VALUES ($1, $2, $3, $4, 'active')
     RETURNING id, public_id, name, color, status, created_at`,
    [userId, publicId, name, color]
  );
  return result.rows[0];
}

// Get chatbot by Public ID
export async function getChatbotByPublicId(publicId: string) {
  const result = await pool.query(
    `SELECT id, public_id, user_id, name, color, created_at
     FROM chatbots
     WHERE public_id = $1`,
    [publicId]
  );
  return result.rows[0] || null;
}

// Get all chatbots for a user
export async function getChatbotsByUserId(userId: number) {
  const result = await pool.query(
    `SELECT id, public_id, name, color, status, created_at
     FROM chatbots
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

// Link a document (by filename) to a chatbot
export async function linkDocumentToChatbot(chatbotId: number, filename: string) {
    // Ideally we should check if file exists for user, but simple link for now
    await pool.query(
        `INSERT INTO chatbot_documents (chatbot_id, filename)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [chatbotId, filename]
    );
}

// Get documents linked to a chatbot
export async function getChatbotDocuments(chatbotId: number) {
    const result = await pool.query(
        `SELECT filename FROM chatbot_documents WHERE chatbot_id = $1`,
        [chatbotId]
    );
    return result.rows.map(row => row.filename);
}

// Search similar documents filtering by chatbot context
export async function searchSimilarDocumentsForChatbot(
  queryEmbedding: number[],
  userId: number,
  chatbotId: string, // Public ID
  limit: number = 5
) {
  // First resolve chatbot public_id to internal id
  const chatbot = await getChatbotByPublicId(chatbotId);
  if (!chatbot) return [];

  // If chatbot found, join with chatbot_documents
  const result = await pool.query(
    `SELECT d.id, d.filename, d.chunk_index, d.content, 
            1 - (d.embedding <=> $1) as similarity
     FROM documents d
     JOIN chatbot_documents cd ON d.filename = cd.filename
     WHERE d.user_id = $2 
       AND cd.chatbot_id = $3
     ORDER BY d.embedding <=> $1
     LIMIT $4`,
    [JSON.stringify(queryEmbedding), userId, chatbot.id, limit]
  );
  return result.rows;
}

// Delete a chatbot
export async function deleteChatbot(publicId: string, userId: number) {
    const result = await pool.query(
        "DELETE FROM chatbots WHERE public_id = $1 AND user_id = $2",
        [publicId, userId]
    );
    return (result.rowCount ?? 0) > 0;
}

// Update a chatbot
export async function updateChatbot(
    publicId: string,
    userId: number,
    name: string,
    color: string
) {
    const result = await pool.query(
        `UPDATE chatbots
         SET name = $1, color = $2
         WHERE public_id = $3 AND user_id = $4
         RETURNING id, public_id, name, color, status, created_at`,
        [name, color, publicId, userId]
    );
    return result.rows[0] || null;
}

// Update linked documents for a chatbot (replace all)
export async function updateChatbotDocuments(chatbotId: number, filenames: string[]) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Remove all existing links
        await client.query(
            'DELETE FROM chatbot_documents WHERE chatbot_id = $1',
            [chatbotId]
        );

        // Insert new links
        if (filenames.length > 0) {
            const values = filenames.map((_, i) => `($1, $${i + 2})`).join(',');
            const query = `INSERT INTO chatbot_documents (chatbot_id, filename) VALUES ${values}`;
            await client.query(query, [chatbotId, ...filenames]);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// ============================================
// API KEY FUNCTIONS
// ============================================

import { createHash, randomBytes } from 'crypto';

// Generate a new API key for a user
export async function generateApiKey(userId: number) {
  // Generate a random key with prefix
  const randomPart = randomBytes(24).toString('base64url'); // 32 chars
  const fullKey = `bd_live_${randomPart}`;
  const keyPrefix = fullKey.substring(0, 12); // "bd_live_xxxx"
  
  // Hash the full key for storage
  const keyHash = createHash('sha256').update(fullKey).digest('hex');
  
  const result = await pool.query(
    `INSERT INTO api_keys (user_id, key_prefix, key_hash)
     VALUES ($1, $2, $3)
     RETURNING id, key_prefix, plan, rate_limit, is_active, created_at`,
    [userId, keyPrefix, keyHash]
  );
  
  // Return the full key (only shown once!) along with metadata
  return {
    ...result.rows[0],
    key: fullKey // Full key only returned on creation
  };
}

// Validate an API key and return user + plan details
export async function validateApiKey(apiKey: string) {
  if (!apiKey || !apiKey.startsWith('bd_live_')) {
    return null;
  }
  
  const keyHash = createHash('sha256').update(apiKey).digest('hex');
  
  const result = await pool.query(
    `SELECT ak.id, ak.user_id, ak.plan, ak.rate_limit, ak.is_active,
            u.id as user_internal_id, u.cuid, u.email, u.name as user_name, u.is_verified
     FROM api_keys ak
     JOIN users u ON ak.user_id = u.id
     WHERE ak.key_hash = $1 AND ak.is_active = TRUE`,
    [keyHash]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const row = result.rows[0];
  
  // Update last_used_at asynchronously (don't wait)
  pool.query(
    'UPDATE api_keys SET last_used_at = NOW() WHERE id = $1',
    [row.id]
  ).catch(() => {}); // Ignore errors
  
  return {
    keyId: row.id,
    plan: row.plan,
    rateLimit: row.rate_limit,
    user: {
      id: row.user_internal_id,
      cuid: row.cuid,
      email: row.email,
      name: row.user_name,
      isVerified: row.is_verified
    }
  };
}

// Get user by API key (simpler version for auth middleware)
export async function getUserByApiKey(apiKey: string) {
  const data = await validateApiKey(apiKey);
  return data?.user || null;
}

// List all API keys for a user (masked)
export async function listApiKeys(userId: number) {
  const result = await pool.query(
    `SELECT id, key_prefix, plan, rate_limit, last_used_at, is_active, created_at
     FROM api_keys
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

// Revoke (deactivate) an API key
export async function revokeApiKey(keyId: number, userId: number) {
  const result = await pool.query(
    `UPDATE api_keys SET is_active = FALSE
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [keyId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

// Delete an API key permanently
export async function deleteApiKey(keyId: number, userId: number) {
  const result = await pool.query(
    `DELETE FROM api_keys WHERE id = $1 AND user_id = $2`,
    [keyId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

// ============================================
// CHAT SESSION & ANALYTICS FUNCTIONS
// ============================================

// Create or get a chat session
export async function createChatSession(sessionId: string, chatbotId: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // First, close any previous open sessions for this chatbot that aren't the current session
    // Set their ended_at to the timestamp of their last message, or started_at if no messages
    await client.query(
      `UPDATE chat_sessions cs
       SET ended_at = COALESCE(
         (SELECT MAX(cm.created_at) FROM chat_messages cm WHERE cm.session_id = cs.session_id),
         cs.started_at
       )
       WHERE cs.chatbot_id = $1 
         AND cs.session_id != $2
         AND cs.ended_at IS NULL`,
      [chatbotId, sessionId]
    );
    
    // Use upsert to handle duplicate session IDs gracefully
    const result = await client.query(
      `INSERT INTO chat_sessions (session_id, chatbot_id)
       VALUES ($1, $2)
       ON CONFLICT (session_id) DO UPDATE SET chatbot_id = $2
       RETURNING id, session_id, chatbot_id, started_at`,
      [sessionId, chatbotId]
    );
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// End a chat session (set ended_at timestamp)
export async function endChatSession(sessionId: string) {
  const result = await pool.query(
    `UPDATE chat_sessions 
     SET ended_at = NOW() 
     WHERE session_id = $1 AND ended_at IS NULL
     RETURNING id`,
    [sessionId]
  );
  return (result.rowCount ?? 0) > 0;
}

// Log a chat message and increment session message count
export async function logChatMessage(
  sessionId: string,
  chatbotId: number,
  userMessage: string,
  botResponse: string
) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert the message
    const msgResult = await client.query(
      `INSERT INTO chat_messages (session_id, chatbot_id, user_message, bot_response)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [sessionId, chatbotId, userMessage, botResponse]
    );
    
    // Increment message count on session
    await client.query(
      `UPDATE chat_sessions SET message_count = message_count + 1 WHERE session_id = $1`,
      [sessionId]
    );
    
    await client.query('COMMIT');
    return msgResult.rows[0].id;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Get total conversation (message) count for a user across all their chatbots
export async function getTotalConversationCount(userId: number) {
  const result = await pool.query(
    `SELECT COUNT(*) as count
     FROM chat_messages cm
     JOIN chatbots c ON cm.chatbot_id = c.id
     WHERE c.user_id = $1`,
    [userId]
  );
  return parseInt(result.rows[0].count || '0');
}

// Get daily conversation stats for the last N days
export async function getDailyConversationStats(userId: number, days: number = 30) {
  const result = await pool.query(
    `SELECT 
       DATE(cm.created_at) as date,
       COUNT(*) as count
     FROM chat_messages cm
     JOIN chatbots c ON cm.chatbot_id = c.id
     WHERE c.user_id = $1 
       AND cm.created_at >= NOW() - INTERVAL '${days} days'
     GROUP BY DATE(cm.created_at)
     ORDER BY date ASC`,
    [userId]
  );
  return result.rows;
}

// Get session logs for a user's chatbots
export async function getSessionLogs(userId: number, limit: number = 50) {
  const result = await pool.query(
    `SELECT 
       cs.session_id,
       cs.started_at,
       cs.ended_at,
       cs.message_count,
       c.name as chatbot_name,
       c.public_id as chatbot_public_id,
       EXTRACT(EPOCH FROM (
         COALESCE(
           cs.ended_at,
           (SELECT MAX(cm.created_at) FROM chat_messages cm WHERE cm.session_id = cs.session_id),
           cs.started_at
         ) - cs.started_at
       )) as duration_seconds
     FROM chat_sessions cs
     JOIN chatbots c ON cs.chatbot_id = c.id
     WHERE c.user_id = $1
     ORDER BY cs.started_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

// Get chatbot internal ID from public ID (needed for session creation)
export async function getChatbotInternalId(publicId: string): Promise<number | null> {
  const result = await pool.query(
    `SELECT id FROM chatbots WHERE public_id = $1`,
    [publicId]
  );
  return result.rows[0]?.id || null;
}

export { pool };

