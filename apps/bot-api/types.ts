import type { STATUS_CODES, USER_ROLES } from "./utils/appConfig";

export type EmailServiceConfig = {
    host: string;
    port: number;
    secure: boolean
    auth: {
        user: string,
        pass: string
    }
}
export type StatusCode = typeof STATUS_CODES[keyof typeof STATUS_CODES]
export type UserRole = keyof typeof USER_ROLES