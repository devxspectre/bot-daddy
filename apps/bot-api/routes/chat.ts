import { Router } from "express";
import type { Request, Response } from "express";
import { generateEmbedding, generateText } from "../ai";
import { searchSimilarDocuments } from "../db";

const router = Router();

// System prompt for professional business responses
const SYSTEM_PROMPT = `You are a professional business representative. Respond as if you ARE the business speaking to a potential client.

STYLE:
- Use first person ("we", "our", "us")
- Be professional, warm, and helpful
- Answer confidently based on your understanding of the business

IMPORTANT:
- Use the business information below to answer questions
- Apply your reasoning and understanding - connect related concepts freely
- Never mention "documents", "context", or "files"
- Only if you truly cannot answer, offer to connect with customer support

BUSINESS INFORMATION:
{CONTEXT}

INQUIRY: {QUESTION}

RESPONSE:`;


// POST /api/v1/chat - Query the RAG system
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, topK = 5 } = req.body;

    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Query is required" });
      return;
    }

    console.log(`Processing query: "${query}"`);

    // Step 1: Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    if (!queryEmbedding) {
      res.status(500).json({ error: "Failed to generate query embedding" });
      return;
    }

    // Step 2: Search for similar document chunks
    const similarDocs = await searchSimilarDocuments(queryEmbedding, topK);

    if (similarDocs.length === 0) {
      res.status(200).json({
        answer: "No documents have been uploaded yet. Please upload a PDF first.",
        sources: [],
      });
      return;
    }

    // Step 3: Build context from retrieved chunks
    const context = similarDocs
      .map((doc, i) => `[${i + 1}] From "${doc.filename}":\n${doc.content}`)
      .join("\n\n");

    // Step 4: Create prompt with context
    const prompt = SYSTEM_PROMPT
      .replace("{CONTEXT}", context)
      .replace("{QUESTION}", query);

    // Step 5: Generate response using the LLM
    const answer = await generateText(prompt);

    // Step 6: Return answer with sources
    res.status(200).json({
      answer,
      sources: similarDocs.map((doc) => ({
        filename: doc.filename,
        chunkIndex: doc.chunk_index,
        similarity: Math.round(doc.similarity * 100) / 100,
        preview: doc.content.substring(0, 150) + "...",
      })),
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to process query",
    });
  }
});



export { router as chatRouter };