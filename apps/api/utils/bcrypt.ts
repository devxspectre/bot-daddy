import bcrypt from 'bcryptjs'
import { BCRYPT_SALT } from './appConfig'

export async function hashPassword(text: string): Promise<string> {
    return await bcrypt.hash(text, BCRYPT_SALT)

}

export async function verifyPassword(text: string, hash: string): Promise<boolean> {
    return bcrypt.compare(text, hash)
}