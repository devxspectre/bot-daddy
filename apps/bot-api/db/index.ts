import { Pool } from 'pg';
import 'dotenv/config';

// Default to user's Docker PostgreSQL setup
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres';

const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Initialize pgvector extension and create documents table
export async function initDatabase() {
  const client = await pool.connect();
  try {
    // Enable pgvector extension
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');
    
    // Create documents table for storing PDF chunks with embeddings
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        chunk_index INTEGER NOT NULL,
        content TEXT NOT NULL,
        embedding vector(1024),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create index for similarity search (only if table has data)
    await client.query(`
      CREATE INDEX IF NOT EXISTS documents_embedding_idx 
      ON documents USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `).catch(() => {
      // IVFFlat index requires data, will be created later
      console.log('Note: IVFFlat index will be created after data is inserted');
    });
    
    console.log('Database initialized successfully');
  } finally {
    client.release();
  }
}

// Insert a document chunk with its embedding
export async function insertDocumentChunk(
  filename: string,
  chunkIndex: number,
  content: string,
  embedding: number[]
) {
  const result = await pool.query(
    `INSERT INTO documents (filename, chunk_index, content, embedding) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id`,
    [filename, chunkIndex, content, JSON.stringify(embedding)]
  );
  return result.rows[0].id;
}

// Search for similar documents using cosine similarity
export async function searchSimilarDocuments(
  queryEmbedding: number[],
  limit: number = 5
) {
  const result = await pool.query(
    `SELECT id, filename, chunk_index, content, 
            1 - (embedding <=> $1) as similarity
     FROM documents
     ORDER BY embedding <=> $1
     LIMIT $2`,
    [JSON.stringify(queryEmbedding), limit]
  );
  return result.rows;
}

export { pool };
