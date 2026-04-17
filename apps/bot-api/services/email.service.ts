import nodemailer, { type SendMailOptions, type Transporter } from "nodemailer";
import "dotenv/config";
import { emailServiceConfig } from "../utils/appConfig";
import type { EmailServiceConfig } from "../types";
import loggerService from "./logger.service";



class EmailService {

  private transporter: Transporter
  private user: string
  private static _instance: EmailService | null = null

  private constructor(config: EmailServiceConfig) {
    const { host, port, secure, auth } = config
    if (!auth.user || !auth.pass) {
      loggerService.error(
        'SMTP config missing from the environment variables', { service: "EmailService" }
      )
    }
    this.user = auth.user
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth
    })
  }

  static getInstance(config: EmailServiceConfig) {
    if (!this._instance) {
      this._instance = new EmailService(config)
    }
    return this._instance
  }

  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTPEmail(email: string, otp: string): Promise<boolean> {
    try {
      const mailOptions: SendMailOptions = {
        from: `"Bot Daddy" <${this.user}>`,
        to: email,
        subject: "Verify Your Email - Bot Daddy",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Verify Your Email</h2>
          <p>Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otp}</span>
          </div>
          <p>This code expires in 10 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${email}`);
      return true;
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      return false;
    }
  }

}

const emailService = EmailService.getInstance(emailServiceConfig)

export { EmailService }
export default emailService