import { Router } from "express";
import type { Request, Response } from "express";
import { createId } from "@paralleldrive/cuid2";
import { insertChatbot, getChatbotByPublicId, getChatbotsByUserId, linkDocumentToChatbot, deleteChatbot, updateChatbot, updateChatbotDocuments, getChatbotDocuments } from "../services/db";
import { type AuthRequest, authenticateToken } from "../middleware/auth";

const router = Router();

// POST /api/v1/chatbot - Create a new chatbot
router.post("/", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, color, files } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!name) {
      res.status(400).json({ error: "Chatbot name is required" });
      return;
    }
    
    // Generate a public ID for the chatbot
    const publicId = createId();

    const chatbot = await insertChatbot(userId, publicId, name, color || '#000000');

    // Link documents if provided
    if (files && Array.isArray(files) && files.length > 0) {
        for (const filename of files) {
            await linkDocumentToChatbot(chatbot.id, filename);
        }
    }

    res.status(201).json({
      success: true,
      chatbot
    });
  } catch (error) {
    console.error("Create chatbot error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create chatbot"
    });
  }
});

// GET /api/v1/chatbot - List all chatbots for the user
router.get("/", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const chatbots = await getChatbotsByUserId(userId);

    res.status(200).json({
      success: true,
      chatbots
    });
  } catch (error) {
    console.error("List chatbots error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to list chatbots"
    });
  }
});

// GET /api/v1/chatbot/public/:publicId - Get chatbot config (Public route for embed)
router.get("/public/:publicId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      res.status(400).json({ error: "Chatbot ID is required" });
      return;
    }

    const chatbot = await getChatbotByPublicId(publicId);

    if (!chatbot) {
      res.status(404).json({ error: "Chatbot not found" });
      return;
    }

    // Return only necessary public info
    res.status(200).json({
      name: chatbot.name,
      color: chatbot.color,
      // We can add more public config here later (e.g., greeting, icon)
    });
  } catch (error) {
    console.error("Get chatbot config error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to get chatbot config"
    });
  }
});

// GET /api/v1/chatbot/:publicId - Get chatbot details (Authenticated)
router.get("/:publicId", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { publicId } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (!publicId) {
            res.status(400).json({ error: "Chatbot ID is required" });
            return;
        }

        const chatbot = await getChatbotByPublicId(publicId);

        if (!chatbot || chatbot.user_id !== userId) {
            res.status(404).json({ error: "Chatbot not found" });
            return;
        }

        const files = await getChatbotDocuments(chatbot.id);

        res.status(200).json({
            success: true,
            chatbot: {
                ...chatbot,
                files
            }
        });
    } catch (error) {
        console.error("Get chatbot details error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to get chatbot details"
        });
    }
});

// PUT /api/v1/chatbot/:publicId - Update a chatbot
router.put("/:publicId", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { publicId } = req.params;
        const { name, color, files } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (!publicId) {
            res.status(400).json({ error: "Chatbot ID is required" });
            return;
        }

        if (!name) {
            res.status(400).json({ error: "Chatbot name is required" });
            return;
        }

        const updatedChatbot = await updateChatbot(publicId, userId, name, color || '#000000');

        if (!updatedChatbot) {
            res.status(404).json({ error: "Chatbot not found or unauthorized" });
            return;
        }

        // Update documents if provided
        if (files && Array.isArray(files)) {
            await updateChatbotDocuments(updatedChatbot.id, files);
        }

        res.status(200).json({
            success: true,
            chatbot: updatedChatbot
        });
    } catch (error) {
        console.error("Update chatbot error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to update chatbot"
        });
    }
});

// DELETE /api/v1/chatbot/:publicId - Delete a chatbot
router.delete("/:publicId", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { publicId } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (!publicId) {
            res.status(400).json({ error: "Chatbot ID is required" });
            return;
        }

        const deleted = await deleteChatbot(publicId, userId);

        if (!deleted) {
            res.status(404).json({ error: "Chatbot not found or unauthorized" });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Chatbot deleted successfully"
        });
    } catch (error) {
        console.error("Delete chatbot error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to delete chatbot"
        });
    }
});

export { router as chatbotRouter };
