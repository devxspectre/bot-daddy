import { Router } from "express";
import { authenticate, } from "../middlewares/auth";
import { userController } from "../controllers";


const router = Router()


router.post('/login', userController.loginUser)
router.post('/signup', userController.createUser)
router.get('/me', authenticate, userController.getCurrentUser)
export default router