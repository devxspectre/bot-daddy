import express, { type NextFunction, type Request, type Response } from "express";
import routes from "./routes";

import cors from "cors";
import { SERVER_PORT } from "./utils/appConfig";
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import dbProvider from '../api/core/db'
import { initEmailService } from "./services/email.service";
import { errorHandler } from "./middlewares/error";


const app = express();

/**
 * Swagger configuration
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Bot-daddy API', version: '1.0.0' },
  },
  apis: ['./src/routes/*.ts'], // Path to your API route files
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


/**
 * Cors config
 */
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

//Global error handler
app.use(errorHandler)


app.use("/api/v1", routes);


// Start and shutdown
const startServer = async () => {
  try {
    await initEmailService()
    await dbProvider.connect()

    app.listen(SERVER_PORT, () => {
      console.log(`Server is running on port ${SERVER_PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
};

startServer();

const shutdown = async () => {
  console.log("Shutting down...");
  await dbProvider.disconnect()
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
