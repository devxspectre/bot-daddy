import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Extended Session interface with custom properties
   */
  interface Session extends DefaultSession {
    user: {
      id: string
      cuid: string
    } & DefaultSession["user"]
    accessToken?: string
  }

  /**
   * Extended User interface with custom properties
   */
  interface User extends DefaultUser {
    cuid?: string
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  /**
   * Extended JWT interface with custom properties
   */
  interface JWT extends DefaultJWT {
    id?: string
    cuid?: string
    accessToken?: string
  }
}
