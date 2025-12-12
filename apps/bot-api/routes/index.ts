import { Router } from "express";
import { fileRouter } from "./file";
import { userRouter } from "./user";
import { chatRouter } from "./chat";

const routes= Router();

routes.use('/file',fileRouter)
routes.use('/user',userRouter)
routes.use('/chat',chatRouter)


export default routes