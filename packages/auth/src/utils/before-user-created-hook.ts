import type { DB, Kysely } from "@taiyomoe/db"
import type { User } from "better-auth"
import { config } from "@taiyomoe/config"
import { normalizeDisplayName, normalizeUsername } from "@taiyomoe/utils"
import { APIError } from "better-auth/api"
import { randomInt } from "node:crypto"

type Candidate = { username: string; displayUsername: string }

const MAX_SUFFIXED_ATTEMPTS = 5
const withSuffix = (base: string, suffix: string, max: number) =>
  `${base.slice(0, max - suffix.length)}${suffix}`
const createSuffixedCandidate = (username: string, displayName: string): Candidate => {
  const suffix = `_${randomInt(1000, 10000)}`

  return {
    username: withSuffix(username, suffix, config.auth.username.maxLength),
    displayUsername: withSuffix(displayName, suffix, config.auth.displayName.maxLength),
  }
}
const isTaken = async (db: Kysely<DB>, { username, displayUsername }: Candidate) => {
  const row = await db
    .selectFrom("users")
    .select("id")
    .where((eb) =>
      eb.or([eb("username", "=", username), eb("displayUsername", "=", displayUsername)]),
    )
    .executeTakeFirst()

  return row !== undefined
}

export const createBeforeUserCreatedHook =
  ({ db }: { db: Kysely<DB> }) =>
  async (user: User) => {
    const baseUsername = normalizeUsername(user.name)
    const baseDisplayName = normalizeDisplayName(user.name)

    for (let attempt = 0; attempt <= MAX_SUFFIXED_ATTEMPTS; attempt++) {
      const candidate =
        attempt === 0
          ? { username: baseUsername, displayUsername: baseDisplayName }
          : createSuffixedCandidate(baseUsername, baseDisplayName)

      if (!(await isTaken(db, candidate))) {
        return { data: { ...user, name: baseDisplayName, ...candidate } }
      }
    }

    throw new APIError("BAD_REQUEST", {
      code: "USERNAME_IS_ALREADY_TAKEN",
      message: "Could not derive a unique username",
    })
  }
