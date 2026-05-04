import jwt from "jsonwebtoken"
import { logger } from "../services"
import type { UserRole } from "../types"



export const verifyToken = async (token: string): Promise<{ userId: string, email: string, userRole: UserRole } | null> => {
    try {
        const decodedValue = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, email: string, userRole: UserRole }
        return decodedValue
    } catch (error) {
        logger.error('Error verifying token', { error })
        return null
    }
}

export const generateToken = (payload: { userId: string, email: string, userRole: UserRole }): string => {
    return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' })
}