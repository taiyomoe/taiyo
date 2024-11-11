import NextAuth from "next-auth"
import { authConfig } from "./config"

const { handlers, auth } = NextAuth(authConfig)

export { handlers, auth }
export type { Session } from "next-auth"
export * from "next-auth/react"
