import express, { type Request, type Response } from "express";
import cors from "cors";
import { initDatabase } from "./services";

const app = express();

app.use(cors({
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  return res.json({
    message: "Server running healthy",
  });
});

// Use top-level await to ensure routes are loaded before export
const routesModule = await import("./routes");
app.use("/api/v1", routesModule.default);

// Initialize database (async, don't block)
initDatabase().catch((err: any) => {
  console.error("Failed to initialize database:", err);
});

export default app;
