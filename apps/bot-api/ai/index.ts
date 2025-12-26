import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import "dotenv/config";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "text-embedding-004", // Modern Gemini embedding model
  taskType: TaskType.RETRIEVAL_DOCUMENT,
});

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0.7,
});

export async function generateEmbedding(text: string) {
  const result = await embeddings.embedQuery(text);
  return result;
}

export async function generateText(prompt: string) {
  const response = await model.invoke(prompt);
  return response.content as string;
}

export async function* generateTextStream(prompt: string) {
  const stream = await model.stream(prompt);

  for await (const chunk of stream) {
    if (chunk.content) {
      yield chunk.content as string;
    }
  }
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
  const results = await embeddings.embedDocuments(texts);
  return results;
}
