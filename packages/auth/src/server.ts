import type { Auth, Session, User } from "./config"

export { toNextJsHandler } from "better-auth/next-js"

export { captchaEndpoints, createAuth, rateLimitRules } from "./config"

export type { Auth, Session, User }
