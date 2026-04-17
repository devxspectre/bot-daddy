import type { EmailServiceConfig } from "../types"

export const serverPort = process.env.PORT ?? "3001"
export const jwtSecret = process.env.JWT_SECRET ?? "Enter_your_jwt_secret"


export const emailServiceConfig: EmailServiceConfig = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER ?? "Enter_your_user_name",
        pass: process.env.SMTP_PASS ?? "Enter_your_password",
    },
}

export const STATUS_CODES = {
    NOT_FOUND: 404,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    INTERNAL_SERVER_ERROR: 500,
    OK: 200,
    CREATED: 201
} as const


export const USER_ROLES = {
    ADMIN: 'admin',
    USER: 'user'
} as const