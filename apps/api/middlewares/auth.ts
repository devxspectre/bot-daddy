import userService from "../services/user.service"
import { type NextFunction, type Response } from "express"
import { AppError } from "../utils/appError"
import { STATUS_CODES } from "../utils/appConfig"
import { verifyPassword } from "../utils/bcrypt"
import type { AuthRequest } from "../types"
import { verifyToken } from "../utils/auth"

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.substring(7)
    if (!token) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: 'Token is missing' })
    }
    const verifiedUser = await verifyToken(token)
    if (!verifiedUser) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: 'Invalid token' })
    }
    if (!verifiedUser.userId || !verifiedUser.email) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: 'Invalid token payload' })
    }
    req.user = {
        userId: verifiedUser.userId,
        email: verifiedUser.email,
        userRole: verifiedUser.userRole ?? 'USER'
    }
    next()

}

export const authorize = (req: AuthRequest, res: Response, next: NextFunction, roles: string[]) => {
    if (!req.user) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: 'User not authenticated' })
    }
    if (!roles.includes(req.user.userRole)) {
        return res.status(STATUS_CODES.FORBIDDEN).json({ message: 'User not authorized' })
    }
    next()
}