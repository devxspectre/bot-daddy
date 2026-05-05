import { Model, type InferAttributes, type InferCreationAttributes } from "sequelize";
import type { STATUS_CODES, USER_PLAN, USER_ROLE } from "./utils/appConfig";
import type { Request } from "express";


export interface AuthRequest extends Request {
    user?: {
        userId: string;
        userRole: UserRole
        email: string;
    };
}

export type EmailServiceConfig = {
    host: string;
    port: number;
    secure: boolean
    auth: {
        user: string,
        pass: string
    }
}


export type StatusCode = typeof STATUS_CODES[keyof typeof STATUS_CODES]

export type UserRole = keyof typeof USER_ROLE

export type UserRoleEnum = typeof USER_ROLE[UserRole];

export type UserPlan = keyof typeof USER_PLAN

export type UserPlanEnum = typeof USER_PLAN[keyof typeof USER_PLAN]


class User extends Model<
    InferAttributes<User>,
    InferCreationAttributes<User>
> {
    declare userId: string;
    declare email: string;
    declare password: string;
    declare firstName: string;
    declare lastName: string;
    declare userRole?: UserRole;
    declare userPlan?: UserPlan;
    declare createdAt?: Date;
    declare updatedAt?: Date;
    declare emailVerified?: boolean;
}
export { User as UserModel }

