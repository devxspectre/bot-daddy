import nodemailer, { type SendMailOptions, type Transporter } from "nodemailer";
import { EMAIL_SERVICE_CONFIG } from "../utils/appConfig";
import type { EmailServiceConfig } from "../types";
import loggerService from "./logger.service";
import { logger } from ".";

class EmailService {
  private transporter!: Transporter;
  private user!: string;
  private static _instance: EmailService | null = null;
  private initialized = false;

  private constructor() { }

  // ✅ Proper async initialization
  async init(config: EmailServiceConfig) {
    if (this.initialized) return;

    const isDev = process.env.NODE_ENV !== "production";

    try {
      if (isDev) {
        const testAccount = await nodemailer.createTestAccount();

        this.user = testAccount.user;

        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        logger.info("EmailService initialized with Ethereal (dev)");
      } else {
        const { host, port, secure, auth } = config;

        if (!auth?.user || !auth?.pass) {
          throw new Error("SMTP config missing credentials");
        }

        this.user = auth.user;

        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth,
        });

        logger.info("EmailService initialized with SMTP (prod)");
      }

      this.initialized = true;
    } catch (error) {
      loggerService.error("EmailService initialization failed", {
        error,
        service: "EmailService",
      });
      throw error;
    }
  }

  // ✅ Singleton (async-safe)
  static async getInstance(config: EmailServiceConfig) {
    if (!this._instance) {
      const service = new EmailService();
      await service.init(config);
      this._instance = service;
    }
    return this._instance;
  }

  // ✅ Shared send method (DRY)
  private async sendMail(options: SendMailOptions): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail(options);

      // Dev preview URL
      if (process.env.NODE_ENV !== "production") {
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) {
          logger.info(`Email preview: ${preview}`);
        }
      }

      return true;
    } catch (error) {
      logger.error("Email send failed", {
        error,
        service: "EmailService",
      });
      return false;
    }
  }


  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    return this.sendMail({
      from: `"Bot Daddy" <${this.user}>`,
      to: email,
      subject: "Welcome to Bot Daddy",
      html: `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:24px; background:#f9fafb;">
      
      <div style="background:#ffffff; padding:24px; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        
        <h2 style="color:#111827; margin-bottom:12px;">
          Welcome to Bot Daddy, ${name} 👋
        </h2>

        <p style="color:#374151; font-size:15px; line-height:1.6;">
          We’re glad to have you on board. Your account has been successfully created and you’re now part of the Bot Daddy platform.
        </p>

        <p style="color:#374151; font-size:15px; line-height:1.6;">
          Our goal is to help you build, automate, and scale with ease — without unnecessary complexity.
        </p>

        <p style="color:#374151; font-size:15px; line-height:1.6;">
          We respect your inbox. You will <strong>not</strong> receive promotional or marketing emails from us — only essential updates related to your account and activity.
        </p>

        <p style="color:#374151; font-size:15px; line-height:1.6;">
          If you ever need assistance, our team is here to help.
        </p>

        <hr style="margin:24px 0; border:none; border-top:1px solid #e5e7eb;" />

        <p style="color:#9ca3af; font-size:12px; text-align:center;">
          © ${new Date().getFullYear()} Bot Daddy. All rights reserved.
        </p>

      </div>
    </div>
    `,
    });
  }

  async sendOTPEmail(email: string, otp: string): Promise<boolean> {
    return this.sendMail({
      from: `"Bot Daddy" <${this.user}>`,
      to: email,
      subject: "Verify Your Email - Bot Daddy",
      html: `
      <div style="font-family: Arial; max-width:600px; margin:auto; padding:20px;">
        <h2>Verify Your Email</h2>
        <p>Your verification code:</p>
        <div style="padding:20px; text-align:center; background:#f3f4f6;">
          <span style="font-size:28px; letter-spacing:6px;">${otp}</span>
        </div>
      </div>
      `,
    });
  }
}
let emailServiceInstance: EmailService | null = null;

export const initEmailService = async () => {
  if (!emailServiceInstance) {
    emailServiceInstance = await EmailService.getInstance(EMAIL_SERVICE_CONFIG);
  }
  return emailServiceInstance;
};

function getEmailService() {
  if (!emailServiceInstance) {
    throw new Error("EmailService not initialized. Call initEmailService() first.");
  }
  return emailServiceInstance;
};

const emailService = getEmailService()
export default emailService
