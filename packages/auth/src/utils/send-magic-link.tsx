import type { DB, Kysely } from "@taiyomoe/db"
import { MagicLinkEmail, resend } from "@taiyomoe/email"
import { APIError } from "better-auth/api"

export const createSendMagicLink =
  ({ db }: { db: Kysely<DB> }) =>
  async (data: { email: string; url: string; token: string }) => {
    const user = await db
      .selectFrom("users")
      .selectAll()
      .where("email", "=", data.email)
      .executeTakeFirst()

    if (!user || !user.email) {
      throw new APIError("BAD_REQUEST", { message: "Failed to send magic link" })
    }

    await resend.emails.send({
      from: "Taiyō <no-reply@taiyo.moe>",
      to: user.email,
      subject: "Your magic link for Taiyō",
      react: <MagicLinkEmail name={user.name} url={data.url} />,
    })
  }
