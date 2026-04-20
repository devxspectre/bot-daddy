import { UserService } from "../services/user.service"

const userController = {

    loginUser: async (req: Request, res: Response): void => {
        try {
            const data = await UserService.createUser()
        }
        catch (error) {
            handleControllerError(res, error)
        }

    }


}