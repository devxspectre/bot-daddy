import { Router } from "express";
import type { Request, Response } from "express";
import { 
  getUserByCuid, 
  getTotalConversationCount, 
  getDailyConversationStats, 
  getSessionLogs 
} from "../services";

const router = Router();

// Middleware to extract user from authorization header
async function getUserFromAuth(req: Request): Promise<{ id: number; cuid: string } | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  
  try {
    const token = authHeader.substring(7);
    const jwt = await import("jsonwebtoken");
    const decoded = jwt.default.verify(
      token, 
      process.env.JWT_SECRET || "your-secret-key-change-in-production"
    ) as { userId: number; cuid: string };
    
    const user = await getUserByCuid(decoded.cuid);
    return user;
  } catch {
    return null;
  }
}

// GET /api/v1/analytics/summary - Get total conversation count
router.get("/summary", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await getUserFromAuth(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const totalConversations = await getTotalConversationCount(user.id);
    
    res.status(200).json({
      totalConversations,
    });
  } catch (error) {
    console.error("Analytics summary error:", error);
    res.status(500).json({ error: "Failed to fetch analytics summary" });
  }
});

// GET /api/v1/analytics/daily - Get daily conversation stats
router.get("/daily", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await getUserFromAuth(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const days = parseInt(req.query.days as string) || 30;
    const dailyStats = await getDailyConversationStats(user.id, Math.min(days, 90));
    
    res.status(200).json({
      stats: dailyStats,
    });
  } catch (error) {
    console.error("Daily analytics error:", error);
    res.status(500).json({ error: "Failed to fetch daily analytics" });
  }
});

// GET /api/v1/analytics/sessions - Get session logs
router.get("/sessions", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await getUserFromAuth(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const sessions = await getSessionLogs(user.id, Math.min(limit, 100));
    
    res.status(200).json({
      sessions,
    });
  } catch (error) {
    console.error("Session logs error:", error);
    res.status(500).json({ error: "Failed to fetch session logs" });
  }
});

export { router as analyticsRouter };
