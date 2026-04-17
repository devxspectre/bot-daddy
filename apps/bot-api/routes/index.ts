import { Router } from "express";
import { fileRouter } from "./file";
import { userRouter } from "./user";
import { chatRouter } from "./chat";
import { chatbotRouter } from "./chatbot";
import { apiKeysRouter } from "./api-keys";
import { analyticsRouter } from "./analytics.route";

const router = Router();

router.use('/file', fileRouter)
router.use('/user', userRouter)
router.use('/chat', chatRouter)
router.use('/chatbot', chatbotRouter)
router.use('/api-keys', apiKeysRouter)
router.use('/analytics', analyticsRouter)


export default router