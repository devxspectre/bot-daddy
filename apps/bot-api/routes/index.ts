import { Router } from "express";
import { fileRouter } from "./file";
import { userRouter } from "./user";
import { chatRouter } from "./chat";
import { chatbotRouter } from "./chatbot";
import { apiKeysRouter } from "./api-keys";
import { analyticsRouter } from "./analytics";

const routes= Router();

routes.use('/file',fileRouter)
routes.use('/user',userRouter)
routes.use('/chat',chatRouter)
routes.use('/chatbot',chatbotRouter)
routes.use('/api-keys',apiKeysRouter)
routes.use('/analytics',analyticsRouter)


export default routes