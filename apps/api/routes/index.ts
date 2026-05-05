import { Router } from "express";


// import { default as fileRouter } from "./file.routes";
import { default as userRouter } from "./user.routes";
// import { default as chatRouter } from "./chat.routes";
// import { default as chatbotRouter } from "./chatbot.routes";
// import { default as apiKeyRouter } from "./apiKey.routes";
// import { default as analyticsRouter } from "./analytics.route";

const router = Router();

// router.use('/file', fileRouter)
router.use('/user', userRouter)
// router.use('/chat', chatRouter)
// router.use('/chatbot', chatbotRouter)
// router.use('/api-keys', apiKeyRouter)
// router.use('/analytics', analyticsRouter)


export default router