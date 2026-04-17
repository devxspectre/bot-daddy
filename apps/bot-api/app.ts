import express, { type Request, type Response } from "express";
import routes from "./routes";

import cors from "cors";
import { initDatabase } from "./services";
import { serverPort } from "./utils/appConfig";


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




app.use("/api/v1", routes);

app.listen(serverPort, () => {
  console.log(`Server is running on port ${serverPort}`);
  initDatabase().then(() => {
    console.log("Database initialized successfully");
  }).catch((error) => {
    console.error("Error initializing database:", error);
    process.exit(1);
  });
});


