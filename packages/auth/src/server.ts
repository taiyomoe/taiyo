import type { Auth, Session, User } from "./config"

export { captchaEndpoints, createAuth, rateLimitRules } from "./config"

export * from "./utils/before-user-created-hook"

export type { Auth, Session, User }
