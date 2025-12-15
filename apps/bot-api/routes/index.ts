import { Router } from "express";
import { fileRouter } from "./file";
import { userRouter } from "./user";
import { chatRouter } from "./chat";
import { chatbotRouter } from "./chatbot";

const routes= Router();

routes.use('/file',fileRouter)
routes.use('/user',userRouter)
routes.use('/chat',chatRouter)
routes.use('/chatbot',chatbotRouter)


export default routes