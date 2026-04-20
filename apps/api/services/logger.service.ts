import winston from "winston";

interface ILogger {
    info(message: string, meta?: Record<string, any>): void,
    error(message: string, meta?: Record<string, any>): void,
    warn(message: string, meta?: Record<string, any>): void,
    debug(message: string, meta?: Record<string, any>): void,

}

class ConsoleLogger implements ILogger {
    info(message: string, meta?: Record<string, any>) {
        console.log(`INFO: ${message}`, meta ?? "");
    }

    error(message: string, meta?: Record<string, any>) {
        console.error(`ERROR: ${message}`, meta ?? "");
    }

    warn(message: string, meta?: Record<string, any>) {
        console.warn(`WARN: ${message}`, meta ?? "");
    }

    debug(message: string, meta?: Record<string, any>) {
        console.debug(`DEBUG: ${message}`, meta ?? "");
    }
}


class WinstonLogger implements ILogger {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: "info",
            format: winston.format.json(),
            transports: [
                new winston.transports.Console(),
                // add more: file, cloud, etc.
            ],
        });
    }

    info(message: string, meta?: Record<string, any>) {
        this.logger.info(message, meta);
    }

    error(message: string, meta?: Record<string, any>) {
        this.logger.error(message, meta);
    }

    warn(message: string, meta?: Record<string, any>) {
        this.logger.warn(message, meta);
    }

    debug(message: string, meta?: Record<string, any>) {
        this.logger.debug(message, meta);
    }
}

class LoggerService {
    private static instance: ILogger;

    static getInstance(): ILogger {
        if (!this.instance) {
            if (process.env.NODE_ENV === "production") {
                this.instance = new WinstonLogger();
            } else {
                this.instance = new ConsoleLogger();
            }
        }
        return this.instance;
    }
}

const loggerService = LoggerService.getInstance()
export { LoggerService }
export default loggerService