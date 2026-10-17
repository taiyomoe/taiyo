import { getDb } from "@taiyomoe/db"
import { defineCommand } from "citty"
import { createHmac, randomBytes } from "node:crypto"

const DEV_ACCOUNTS = ["user@gmail.com", "admin@gmail.com"]
const USER_AGENT = "pnpm bootstrap"
const LIFETIME_MS = 30 * 24 * 60 * 60 * 1000
const MIN_REMAINING_MS = 24 * 60 * 60 * 1000

export default defineCommand({
  meta: {
    name: "dev-sessions",
    description:
      "Print a ready-to-use session cookie for each seeded dev account, reusing a still-valid one.",
  },
  run: async () => {
    const secret = process.env.BETTER_AUTH_SECRET

    if (secret === undefined || secret === "") {
      throw new Error("BETTER_AUTH_SECRET is not set")
    }

    const db = getDb()
    const users = await db
      .selectFrom("users")
      .select(["id", "email", "username"])
      .where("email", "in", DEV_ACCOUNTS)
      .execute()

    users.sort((a, b) => DEV_ACCOUNTS.indexOf(a.email ?? "") - DEV_ACCOUNTS.indexOf(b.email ?? ""))

    for (const user of users) {
      const existing = await db
        .selectFrom("sessions")
        .select("token")
        .where("userId", "=", user.id)
        .where("userAgent", "=", USER_AGENT)
        .where("expiresAt", ">", new Date(Date.now() + MIN_REMAINING_MS))
        .orderBy("expiresAt", "desc")
        .executeTakeFirst()
      let token = existing?.token

      if (token === undefined) {
        token = randomBytes(24).toString("base64url")

        await db
          .deleteFrom("sessions")
          .where("userId", "=", user.id)
          .where("userAgent", "=", USER_AGENT)
          .execute()
        await db
          .insertInto("sessions")
          .values({
            userId: user.id,
            token,
            expiresAt: new Date(Date.now() + LIFETIME_MS),
            userAgent: USER_AGENT,
          })
          .execute()
      }

      const signature = createHmac("sha256", secret).update(token).digest("base64")

      console.log(
        JSON.stringify({
          username: user.username,
          cookie: `better-auth.session_token=${encodeURIComponent(`${token}.${signature}`)}`,
        }),
      )
    }

    await db.destroy()
    process.exit(0)
  },
})
