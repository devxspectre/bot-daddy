import type { STATUS_CODES } from "./utils/appConfig";

export type EmailServiceConfig = {
    host: string;
    port: number;
    secure: boolean
    auth: {
        user: string,
        pass: string
    }
}
export type StatusCode = keyof typeof STATUS_CODES