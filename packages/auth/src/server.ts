import type { Auth, Session, User } from "./config"

export { toNextJsHandler } from "better-auth/next-js"

export { captchaEndpoints, createAuth, rateLimitRules } from "./config"

export { createBeforeUserCreatedHook } from "./utils/before-user-created-hook"

export type { Auth, Session, User }
