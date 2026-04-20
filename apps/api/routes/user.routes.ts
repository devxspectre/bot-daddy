import { Router } from "express";

const router = Router()


router.post('/login', userController.loginUser(req, res))
export default router