import { Pool } from 'pg';
import 'dotenv/config';

// Default to user's Docker PostgreSQL setup
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres';

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

// End of file


export { pool };

