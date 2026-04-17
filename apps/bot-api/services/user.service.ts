import { dbService, logger } from "."
import { STATUS_CODES } from "../utils/appConfig"
import { AppError } from "../utils/appError"


export class UserService {
    constructor(private db = dbService) { }

    async getUserDetails(userId: string) {
        const user = await this.db.getUserByCuid(userId)
        if (!user) {
            logger.debug('User not found', {
                userId,
                service: 'UserService',
                method: 'getUserDetails'
            });
            throw new AppError(`User not found`, STATUS_CODES.NOT_FOUND)
        }
        return user
    }
}

