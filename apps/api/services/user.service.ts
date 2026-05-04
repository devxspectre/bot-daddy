import { emailService, logger } from "."
import User from "../models/user";
import type { UserModel, UserRole } from "../types";
import { STATUS_CODES } from "../utils/appConfig"
import { AppError } from "../utils/appError"
import { hashPassword } from "../utils/bcrypt";


class UserService {

    async createUser(input: any, ctx?: any): Promise<UserModel | void> {
        const { firstName, lastName, email, password } = input;
        const { transaction } = ctx
        const existingUser = await this.getUser({ email })
        if (existingUser) {
            throw new AppError('User already exists', STATUS_CODES.BAD_REQUEST)
        }
        const hashedPassword = await hashPassword(password)
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,

        },
            {
                raw: true,
                transaction,
            })
        if (!user) {
            throw new AppError('Failed to create user', STATUS_CODES.INTERNAL_SERVER_ERROR)
        }
        await emailService.sendWelcomeEmail(email, firstName)
        return user as UserModel

    }

    async getUser(where: Partial<UserModel>): Promise<UserModel | null> {
        return await User.findOne({ where, raw: true }) as UserModel | null
    }
}

const userService = new UserService()
export { UserService }
export default userService