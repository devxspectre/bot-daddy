
import { CohereClient } from 'cohere-ai';
import "dotenv/config"

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

export async function generateEmbedding(text: string) {
  const response = await cohere.embed({
    texts: [text],
    model: 'embed-english-v3.0',
    inputType: 'search_document'
  });

  const embeddings = response.embeddings;
  if (!Array.isArray(embeddings)) {
    throw new Error('Unexpected embedding response format');
  }
  return embeddings[0];
}

export async function generateText(prompt: string) {
  const response = await cohere.chat({
    model: 'command-r7b-12-2024',
    message: prompt,
    temperature: 0.7
  });
  return response.text;
}

// Split text into overlapping chunks for RAG
export function chunkText(
  text: string,
  chunkSize: number = 800,
  overlap: number = 100
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    start = end - overlap;
    if (start + overlap >= text.length) break;
  }

  return chunks;
}

// Generate embeddings for multiple texts (batch)
export async function generateEmbeddings(texts: string[]) {
  const response = await cohere.embed({
    texts: texts,
    model: 'embed-english-v3.0',
    inputType: 'search_document'
  });

  const embeddings = response.embeddings;
  if (!Array.isArray(embeddings)) {
    throw new Error('Unexpected embedding response format');
  }
  return embeddings;
}
