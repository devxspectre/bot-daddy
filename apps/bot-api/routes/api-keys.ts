import { Router } from "express";
import type { Response } from "express";
import { type AuthRequest, authenticateToken } from "../middleware/auth";
import { generateApiKey, listApiKeys, revokeApiKey, deleteApiKey, validateApiKey } from "../services/db";

const router = Router();

// GET /api/v1/api-keys - List all API keys for authenticated user
router.get("/", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const keys = await listApiKeys(userId);

        // Mask the keys for security (only show prefix)
        const maskedKeys = keys.map(key => ({
            id: key.id,
            keyPreview: `${key.key_prefix}...`,
            plan: key.plan,
            rateLimit: key.rate_limit,
            lastUsedAt: key.last_used_at,
            isActive: key.is_active,
            createdAt: key.created_at
        }));

        res.status(200).json({
            success: true,
            apiKeys: maskedKeys
        });
    } catch (error) {
        console.error("List API keys error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to list API keys"
        });
    }
});

// POST /api/v1/api-keys - Create a new API key
router.post("/", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const apiKey = await generateApiKey(userId);

        res.status(201).json({
            success: true,
            apiKey: {
                id: apiKey.id,
                key: apiKey.key, // Full key - only shown once!
                keyPreview: `${apiKey.key_prefix}...`,
                plan: apiKey.plan,
                rateLimit: apiKey.rate_limit,
                createdAt: apiKey.created_at
            },
            message: "API key created successfully. Save this key securely - it won't be shown again!"
        });
    } catch (error) {
        console.error("Create API key error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to create API key"
        });
    }
});

// DELETE /api/v1/api-keys/:id - Revoke/delete an API key
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ error: "API key ID is required" });
            return;
        }

        const keyId = parseInt(id, 10);

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (isNaN(keyId)) {
            res.status(400).json({ error: "Invalid API key ID" });
            return;
        }

        // Use revoke (soft delete) instead of hard delete for audit trail
        const revoked = await revokeApiKey(keyId, userId);

        if (!revoked) {
            res.status(404).json({ error: "API key not found" });
            return;
        }

        res.status(200).json({
            success: true,
            message: "API key revoked successfully"
        });
    } catch (error) {
        console.error("Revoke API key error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to revoke API key"
        });
    }
});

// POST /api/v1/api-keys/validate - Validate an API key and get plan info (public endpoint)
router.post("/validate", async (req, res): Promise<void> => {
    try {
        const { apiKey } = req.body;

        if (!apiKey || typeof apiKey !== "string") {
            res.status(400).json({ error: "apiKey is required" });
            return;
        }

        const data = await validateApiKey(apiKey);

        if (!data) {
            res.status(401).json({ error: "Invalid or revoked API key" });
            return;
        }

        res.status(200).json({
            success: true,
            plan: data.plan,
            rateLimit: data.rateLimit,
            user: {
                name: data.user.name,
                email: data.user.email
            }
        });
    } catch (error) {
        console.error("Validate API key error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to validate API key"
        });
    }
});

export { router as apiKeysRouter };
