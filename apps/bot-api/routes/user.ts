import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db";
import { generateOTP, sendOTPEmail } from "../email";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// POST /api/v1/user/signup - Register a new user and send OTP
router.post("/signup", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id, is_verified FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      if (existingUser.rows[0].is_verified) {
        res.status(409).json({ error: "User with this email already exists" });
        return;
      }
      // User exists but not verified - delete and recreate
      await pool.query("DELETE FROM users WHERE email = $1", [email]);
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user (unverified)
    await pool.query(
      `INSERT INTO users (email, password_hash, name, is_verified) 
       VALUES ($1, $2, $3, FALSE)`,
      [email, passwordHash, name || null]
    );

    // Generate and store OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this email
    await pool.query("DELETE FROM email_verifications WHERE email = $1", [email]);

    // Insert new OTP
    await pool.query(
      `INSERT INTO email_verifications (email, otp, expires_at) 
       VALUES ($1, $2, $3)`,
      [email, otp, expiresAt]
    );

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      res.status(500).json({ error: "Failed to send verification email" });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Verification code sent to your email",
      email,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create user",
    });
  }
});

// POST /api/v1/user/verify-otp - Verify OTP and complete registration
router.post("/verify-otp", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ error: "Email and OTP are required" });
      return;
    }

    // Find valid OTP
    const result = await pool.query(
      `SELECT * FROM email_verifications 
       WHERE email = $1 AND otp = $2 AND expires_at > NOW()`,
      [email, otp]
    );

    if (result.rows.length === 0) {
      res.status(400).json({ error: "Invalid or expired verification code" });
      return;
    }

    // Mark user as verified
    await pool.query(
      "UPDATE users SET is_verified = TRUE WHERE email = $1",
      [email]
    );

    // Delete used OTP
    await pool.query("DELETE FROM email_verifications WHERE email = $1", [email]);

    // Get user data
    const userResult = await pool.query(
      "SELECT id, email, name, created_at FROM users WHERE email = $1",
      [email]
    );

    const user = userResult.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to verify OTP",
    });
  }
});

// POST /api/v1/user/resend-otp - Resend verification OTP
router.post("/resend-otp", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    // Check if user exists and is not verified
    const userResult = await pool.query(
      "SELECT id, is_verified FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (userResult.rows[0].is_verified) {
      res.status(400).json({ error: "Email is already verified" });
      return;
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete existing and insert new OTP
    await pool.query("DELETE FROM email_verifications WHERE email = $1", [email]);
    await pool.query(
      `INSERT INTO email_verifications (email, otp, expires_at) VALUES ($1, $2, $3)`,
      [email, otp, expiresAt]
    );

    // Send email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      res.status(500).json({ error: "Failed to send verification email" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Verification code resent to your email",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to resend OTP",
    });
  }
});

// POST /api/v1/user/signin - Login user
router.post("/signin", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    // Find user by email
    const result = await pool.query(
      "SELECT id, email, password_hash, name, is_verified, created_at FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const user = result.rows[0];

    // Check if verified
    if (!user.is_verified) {
      res.status(403).json({ error: "Please verify your email first", requiresVerification: true });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Signed in successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to sign in",
    });
  }
});

// GET /api/v1/user/me - Get current user (protected route)
router.get("/me", async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };

      const result = await pool.query(
        "SELECT id, email, name, is_verified, created_at FROM users WHERE id = $1",
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const user = result.rows[0];

      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isVerified: user.is_verified,
          createdAt: user.created_at,
        },
      });
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

export { router as userRouter };