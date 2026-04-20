
import { CohereClient } from 'cohere-ai';
import "dotenv/config"
import { COHERE_API_KEY } from '../utils/appConfig';
import { logger } from '../services';

class ModelProvider {

  private client: CohereClient
  static instance: ModelProvider

  constructor(api_key: string) {
    this.client = new CohereClient({ token: api_key })
  }

  static getInstance(api_key: string): ModelProvider {
    if (!ModelProvider.instance) {
      ModelProvider.instance = new ModelProvider(api_key)
    }
    return ModelProvider.instance
  }


  async generateEmbedding(text: string): Promise<number[] | null> {
    const response = await this.client.embed({
      texts: [text],
      model: 'embed-english-v3.0',
      inputType: 'search_document'
    });

    const embeddings = response.embeddings;
    if (!Array.isArray(embeddings)) {
      throw new Error('Unexpected embedding response format');
    }

    if (!embeddings || !embeddings[0]) {
      logger.error('Failed to generate embeddings', { service: 'ModelProvider', function: 'generateEmbedding' })
      return null
    }
    return embeddings[0];
  }

  // Generate embeddings for multiple texts (batch)
  async generateBatchEmbeddings(texts: string[]): Promise<number[][] | null> {
    const response = await this.client.embed({
      texts: texts,
      model: 'embed-english-v3.0',
      inputType: 'search_document'
    });

    const embeddings = response.embeddings;
    if (!Array.isArray(embeddings) || !embeddings) {
      logger.error('Invalid embedding format', { service: 'ModelProvider', function: 'generateBatchEmbeddings' })

      return null

    }
    return embeddings;
  }

  async generateText(prompt: string): Promise<string | null> {
    const response = await this.client.chat({
      model: 'command-r7b-12-2024',
      message: prompt,
      temperature: 0.7
    });
    if (!response || !response.text) {
      logger.error('Failed to generate text for the prompt', { service: 'ModelProvider', function: 'generateText' })
      return null
    }
    return response.text;
  }


  // Split text into overlapping chunks for RAG
  chunkText(
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


}

const modelProvider = ModelProvider.getInstance(COHERE_API_KEY)
export { ModelProvider }
export default modelProvider








