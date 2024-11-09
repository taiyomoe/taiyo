import NextAuth from "next-auth"
import { authConfig } from "./config"

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
export type { Session } from "next-auth"
export * from "next-auth/react"
