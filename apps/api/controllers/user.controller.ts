import type { Request, Response } from "express"
import userService from "../services/user.service"
import { STATUS_CODES } from "../utils/appConfig"
import { AppError } from "../utils/appError"
import type { AuthRequest } from "../types"
import { verifyPassword } from "../utils/bcrypt"

export const createUser = async (req: Request, res: Response) => {
    try {
        const input = req.body
        const data = await userService.createUser(input)
        return res.status(STATUS_CODES.CREATED).json({
            message: 'User created successfully',
            data
        })
    }
    catch (error) {
        throw new AppError((error as Error).message, STATUS_CODES.INTERNAL_SERVER_ERROR, { file: 'usercontoller', function: 'createUser' })
    }
}

export const getUser = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId
        if (!userId) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: 'User not authenticated' })
        }
        const data = await userService.getUser({ userId })
        return res.status(STATUS_CODES.OK).json({
            message: 'User retrieved successfully',
            data
        })
    }
    catch (error) {
        throw new AppError((error as Error).message, STATUS_CODES.INTERNAL_SERVER_ERROR, { file: 'usercontoller', function: 'getUser' })
    }
}


export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        const user = await userService.getUser({ email })
        if (!user) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: 'The email does not match our records' })
        }
        if (!user.emailVerified) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: 'Verify your email to login' })
        }
        const isPasswordValid = await verifyPassword(password, user.password)
        if (!isPasswordValid) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: 'Invalid email or password' })
        }
    }
    catch (error) {
        throw new AppError((error as Error).message, STATUS_CODES.INTERNAL_SERVER_ERROR, { file: 'usercontoller', function: 'loginUser' })
    }
}


