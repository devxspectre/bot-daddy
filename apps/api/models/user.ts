import { DataTypes } from "sequelize";
import { db } from "../core/db";
import { USER_PLAN, USER_ROLE } from "../utils/appConfig";
import type { UserPlanEnum, UserRoleEnum } from "../types";


if (!db) {
    throw new Error('DB not initialized')
}

const User = db.define('user', {
    userId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        field: 'user_id'
    },
    firstName:
    {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'first_name'
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'last_name'
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
        field: 'email'
    },
    emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'email_verified'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'password'
    },
    userRole: {
        type: DataTypes.ENUM(...Object.values(USER_ROLE) as UserRoleEnum[]),
        defaultValue: 'USER',
        allowNull: false,
        field: 'type'
    },
    userPlan: {
        type: DataTypes.ENUM(...Object.values(USER_PLAN) as UserPlanEnum[]),
        defaultValue: 'FREE',
        allowNull: false,
        field: 'user_plan'
    },
},
    {
        tableName: 'users',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { unique: true, fields: ['email'] }
        ]
    })

export default User
