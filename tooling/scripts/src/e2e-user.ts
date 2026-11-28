import { getDb } from "@taiyomoe/db"
import { hashPassword } from "better-auth/crypto"
import { defineCommand } from "citty"
import { createHmac, randomBytes, randomUUID } from "node:crypto"

const LIFETIME_MS = 24 * 60 * 60 * 1000

export default defineCommand({
  meta: {
    name: "e2e-user",
    description:
      "Create a throwaway verified user with a fresh session and print it as JSON, for end-to-end tests that change an account for good.",
  },
  args: {
    password: {
      type: "string",
      description: "Give the user this password, as if they signed up with an email.",
    },
  },
  run: async ({ args }) => {
    const secret = process.env.BETTER_AUTH_SECRET

    if (secret === undefined || secret === "") {
      throw new Error("BETTER_AUTH_SECRET is not set")
    }

    const db = getDb()
    const userId = randomUUID()
    const username = `e2e_${userId.replace(/-/g, "").slice(0, 12)}`
    const email = `${username}@e2e.test`
    const token = randomBytes(24).toString("base64url")

    await db
      .insertInto("users")
      .values({
        id: userId,
        name: username,
        email,
        normalizedEmail: email,
        emailVerified: true,
        username,
        displayUsername: username,
      })
      .execute()
    await db.insertInto("userProfiles").values({ userId }).execute()

    if (args.password !== undefined) {
      await db
        .insertInto("accounts")
        .values({
          userId,
          providerId: "credential",
          accountId: userId,
          password: await hashPassword(args.password),
        })
        .execute()
    }

    await db
      .insertInto("sessions")
      .values({ userId, token, expiresAt: new Date(Date.now() + LIFETIME_MS), userAgent: "e2e" })
      .execute()
    await db.destroy()

    const signature = createHmac("sha256", secret).update(token).digest("base64")

    console.log(
      JSON.stringify({
        userId,
        username,
        email,
        cookie: `better-auth.session_token=${encodeURIComponent(`${token}.${signature}`)}`,
      }),
    )
  },
})
