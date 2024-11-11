import NextAuth from "next-auth"
import { authConfig } from "./config"

const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

export { handlers, auth, signIn, signOut }
export type { Session } from "next-auth"
export * from "next-auth/react"
