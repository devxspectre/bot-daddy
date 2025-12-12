import express from "express";
import { PORT } from "./config";
import routes from "./routes";
import { initDatabase } from "./db";

const app = express();

app.use(express.json());

app.use('/api/v1/',routes)

// Initialize database and start server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Bot api started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
