import { Router } from "express";
import type { Request, Response } from "express";
import { generateEmbedding, generateText } from "../ai";
import { searchSimilarDocuments, getUserByCuid, searchSimilarDocumentsForChatbot } from "../services";

const router = Router();

// System prompt for professional business responses
const SYSTEM_PROMPT = `You are an AI assistant that ONLY provides information about a specific business. You must STRICTLY follow these rules.

ABSOLUTE RULES (NEVER BREAK THESE):
1. You can ONLY share information that is EXPLICITLY stated in the BUSINESS INFO section below
2. You are NOT the business - you are a support bot FOR the business
3. NEVER answer questions about yourself (what model you are, how you work, who made you, etc.)
4. NEVER answer general knowledge questions, coding questions, math, trivia, or anything not in BUSINESS INFO
5. NEVER make up or infer information not explicitly in BUSINESS INFO

RESPONSE STYLE:
- Be concise: 1-3 sentences maximum
- Be direct: get to the point immediately
- Be complete: finish your sentences properly
- Be friendly: use a warm, professional tone

FOR ANY OFF-TOPIC QUESTION, respond EXACTLY with:
"I'm here to help with questions about our business and services. How can I assist you with that today?"

BUSINESS INFO:
{CONTEXT}

CUSTOMER QUESTION: {QUESTION}

YOUR CONCISE RESPONSE:`;


// POST /api/v1/chat - Query the RAG system
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, topK = 5, userId } = req.body;

    // userId is MANDATORY
    if (!userId || typeof userId !== "string") {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Query is required" });
      return;
    }

    // Resolve CUID to internal user ID
    const user = await getUserByCuid(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    console.log(`Processing query for user ${userId}: "${query}"`);

    // Step 1: Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    if (!queryEmbedding) {
      res.status(500).json({ error: "Failed to generate query embedding" });
      return;
    }

    // Step 2: Search for similar document chunks (filtered by user)
    let similarDocs;
    
    // If chatbotId is provided (Public ID), filter by that chatbot's documents
    if (req.body.chatbotId) {
        similarDocs = await searchSimilarDocumentsForChatbot(queryEmbedding, user.id, req.body.chatbotId, topK);
    } else {
        // Fallback to searching ALL user documents (legacy behavior)
        similarDocs = await searchSimilarDocuments(queryEmbedding, user.id, topK);
    }

    if (similarDocs.length === 0) {
      res.status(200).json({
        answer: "No relevant documents found in the knowledge base.",
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