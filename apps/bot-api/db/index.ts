import { Pool } from 'pg';
import 'dotenv/config';

// Default to user's Docker PostgreSQL setup
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres';

const pool = new Pool({
  connectionString: DATABASE_URL,
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
  userId: number
) {
  const result = await pool.query(
    `INSERT INTO documents (user_id, filename, chunk_index, content, embedding) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id`,
    [userId, filename, chunkIndex, content, JSON.stringify(embedding)]
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

export { pool };

