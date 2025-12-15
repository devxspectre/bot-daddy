import { Router } from "express";
import type { Request, Response } from "express";
import multer from "multer";
import pdf from "pdf-parse";
import { chunkText, generateEmbeddings } from "../ai";
import { insertDocumentChunk, getUserByCuid, pool } from "../services";

const router = Router();

// Configure multer for memory storage (max 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// POST /api/v1/file/upload - Upload a PDF and store embeddings
router.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      // userId (CUID) is MANDATORY
      const userCuid = req.body.userId;
      if (!userCuid || typeof userCuid !== "string") {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      // Resolve CUID to internal user ID
      const user = await getUserByCuid(userCuid);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const filename = req.file.originalname;
      console.log(`Processing PDF for user ${userCuid}: ${filename}`);

      // Extract text from PDF
      const pdfData = await pdf(req.file.buffer);
      const text = pdfData.text;

      if (!text || text.trim().length === 0) {
        res.status(400).json({ error: "PDF contains no extractable text" });
        return;
      }

      console.log(`Extracted ${text.length} characters from PDF`);

      // Split text into chunks
      const chunks = chunkText(text);
      console.log(`Created ${chunks.length} chunks`);

      // Generate embeddings for all chunks (batch)
      console.log("Generating embeddings...");
      const embeddings = await generateEmbeddings(chunks);

      // Store chunks and embeddings in database
      console.log("Storing in database...");
      const insertedIds: number[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = embeddings[i];
        if (!chunk || !embedding) continue;
        const id = await insertDocumentChunk(
          filename,
          i,
          chunk,
          embedding,
          user.id,
          req.file.size // Pass file size
        );
        insertedIds.push(id);
      }

      console.log(`Stored ${insertedIds.length} chunks successfully`);

      res.status(200).json({
        success: true,
        filename,
        chunks: chunks.length,
        message: `Successfully processed and stored ${chunks.length} chunks from ${filename}`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to process PDF",
      });
    }
  }
);

// GET /api/v1/file/documents - List uploaded documents for a user
router.get("/documents", async (req: Request, res: Response): Promise<void> => {
  try {
    // userId (CUID) is MANDATORY
    const userCuid = req.query.userId as string;
    if (!userCuid) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    // Resolve CUID to internal user ID
    const user = await getUserByCuid(userCuid);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const result = await pool.query(`
      SELECT filename, COUNT(*) as chunks, MAX(created_at) as uploaded_at, MAX(file_size) as size
      FROM documents
      WHERE user_id = $1
      GROUP BY filename
      ORDER BY uploaded_at DESC
    `, [user.id]);
    
    res.status(200).json({
      documents: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("Error listing documents:", error);
    res.status(500).json({ error: "Failed to list documents" });
  }
});

// DELETE /api/v1/file/:filename - Delete a document and its chunks (for a specific user)
router.delete("/:filename", async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    
    // userId (CUID) is MANDATORY
    const userCuid = req.query.userId as string;
    if (!userCuid) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    if (!filename) {
      res.status(400).json({ error: "Filename is required" });
      return;
    }

    // Resolve CUID to internal user ID
    const user = await getUserByCuid(userCuid);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const result = await pool.query(
      "DELETE FROM documents WHERE filename = $1 AND user_id = $2 RETURNING id",
      [filename, user.id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Deleted ${result.rowCount} chunks from "${filename}"`,
      deletedChunks: result.rowCount,
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

// Multer error handling middleware
router.use((error: Error, req: Request, res: Response, next: Function) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ error: "File size must be less than 5MB" });
      return;
    }
  }
  res.status(400).json({ error: error.message });
});

export { router as fileRouter };