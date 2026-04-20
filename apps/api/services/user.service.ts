import { emailService, logger } from "."
import User from "../models/user";
import { STATUS_CODES } from "../utils/appConfig"
import { AppError } from "../utils/appError"
import { hashPassword } from "../utils/bcrypt";




class UserService {

    async createUser(input: any, ctx: any): Promise<void> {
        const { firstName, lastName, email, password } = input;
        const existingUser = await User.findOne({
            where: {
                email
            },
        })
        if (existingUser) {
            throw new AppError('User already exists', STATUS_CODES.BAD_REQUEST)
        }
        const hashedPassword = await hashPassword(password)
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,

        }, {
            returning: true
        })
        if (!user) {
            throw new AppError('Failed to create user', STATUS_CODES.INTERNAL_SERVER_ERROR)
        }
        await emailService.sendWelcomeEmail(email, firstName)

    }
}

const userService = new UserService()
export { UserService }
export default userService

