import { db } from "@taiyomoe/db"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { DateTime } from "luxon"

export const beforeHook = createAuthMiddleware(async (ctx) => {
  /**
   * Before signing-in with email or username,we need to check 2 things:
   *
   * 1. If the user is trying to sign in using an email or username from a non-credential provider
   * 2. If the user is trying to sign in to an account that is not verified and which has a pending verification email
   */
  if (ctx.path === "/sign-in/email" || ctx.path === "/sign-in/username") {
    const user = await db.user.findFirst({
      where: ctx.body.email
        ? { email: ctx.body.email }
        : { username: ctx.body.username },
    })

    if (!user) {
      return
    }

    const accounts = await db.account.findMany({ where: { userId: user.id } })

    // Tried logging in with an email or username from a non-credential provider
    if (!accounts.some((a) => a.providerId === "credential")) {
      throw new APIError("FORBIDDEN", {
        code: ctx.body.email
          ? "INVALID_EMAIL_OR_PASSWORD"
          : "INVALID_USERNAME_OR_PASSWORD",
        message: ctx.body.email
          ? "Invalid email or password"
          : "Invalid username or password",
      })
    }

    // Prevent sending emails too often
    if (user.verificationEmailSentAt) {
      const lastVerificationSentAt = DateTime.fromJSDate(
        user.verificationEmailSentAt,
      )
      const timeLimit = DateTime.now().minus({ minutes: 50 })

      if (lastVerificationSentAt > timeLimit) {
        throw new APIError("FORBIDDEN", {
          code: "VERIFICATION_EMAIL_ALREADY_SENT",
          message: "Verification email already sent",
        })
      }
    }

    await db.user.update({
      where: { id: user.id },
      data: { verificationEmailSentAt: new Date() },
    })

    console.log("sign in", ctx.body)
  }
})
