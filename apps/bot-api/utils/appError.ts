import type { StatusCode } from "../types";


export class AppError extends Error {

    public statusCode: StatusCode | undefined
    constructor(message: string, statusCode?: StatusCode) {
        super(message)
        if (statusCode)
            this.statusCode = statusCode

        // Restore prototype chain (important in TS)
        Object.setPrototypeOf(this, new.target.prototype);

        // cleaner stack traces
        Error.captureStackTrace?.(this, this.constructor);
    }

}

