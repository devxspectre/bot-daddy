import type { Request, Response, NextFunction } from "express";
import { logger } from "../services";

export const errorHandler = (
    error: any,
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error(error)

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
    });
};
