import type { Auth, AuthEmail, Session, User } from "./config"

export { createAuth } from "./config"

/** @internal Exported for its tests. */
export { captchaEndpoints, rateLimitRules } from "./config"

export * from "./utils/before-user-created-hook"

export * from "./utils/normalize-display-name"

export * from "./utils/normalize-username"

export type { Auth, AuthEmail, Session, User }
