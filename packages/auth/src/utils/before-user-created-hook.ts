import type { DB, Kysely } from "@taiyomoe/db"
import type { User } from "better-auth"
import { config } from "@taiyomoe/config"
import { normalizeDisplayName, normalizeUsername } from "@taiyomoe/utils"
import { APIError } from "better-auth/api"
import { randomInt } from "node:crypto"

const MAX_SUFFIXED_ATTEMPTS = 5
const withSuffix = (base: string, suffix: string, max: number) =>
  `${base.slice(0, max - suffix.length)}${suffix}`

export const createBeforeUserCreatedHook =
  ({ db }: { db: Kysely<DB> }) =>
  async (user: User) => {
    const baseUsername = normalizeUsername(user.name)
    const baseDisplayName = normalizeDisplayName(user.name)

    for (let attempt = 0; attempt <= MAX_SUFFIXED_ATTEMPTS; attempt++) {
      const suffix = `_${randomInt(1000, 10000)}`
      const candidate =
        attempt === 0
          ? { username: baseUsername, displayUsername: baseDisplayName }
          : {
              username: withSuffix(baseUsername, suffix, config.auth.username.maxLength),
              displayUsername: withSuffix(
                baseDisplayName,
                suffix,
                config.auth.displayName.maxLength,
              ),
            }
      const taken = await db
        .selectFrom("users")
        .select("id")
        .where((eb) =>
          eb.or([
            eb("username", "=", candidate.username),
            eb("displayUsername", "=", candidate.displayUsername),
          ]),
        )
        .executeTakeFirst()

      if (taken === undefined) {
        return { data: { ...user, name: baseDisplayName, ...candidate } }
      }
    }

    throw new APIError("BAD_REQUEST", {
      code: "USERNAME_IS_ALREADY_TAKEN",
      message: "Could not derive a unique username",
    })
  }
