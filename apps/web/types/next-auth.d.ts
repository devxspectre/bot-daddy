import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id. */
      id: string
      /** The user's CUID (public identifier). */
      cuid: string
    } & DefaultSession["user"]
    accessToken?: string
  }
  
  interface User {
    accessToken?: string
    cuid?: string
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** User ID */
    id: string
    /** User CUID (public identifier) */
    cuid: string
    /** Backend API token */
    accessToken?: string
  }
}

