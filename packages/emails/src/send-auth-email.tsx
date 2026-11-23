import type { AuthEmail } from "@taiyomoe/auth/server"
import { sendEmail } from "./client"
import AccountDeletedEmail from "./templates/account-deleted-email"
import ChangeEmailEmail from "./templates/change-email-email"
import DeleteAccountEmail from "./templates/delete-account-email"
import MagicLinkEmail from "./templates/magic-link-email"
import ResetPasswordEmail from "./templates/reset-password-email"
import SignUpEmail from "./templates/sign-up-email"

const toMessage = (email: AuthEmail) => {
  const { name } = email

  if (email.kind === "account-deleted") {
    return { subject: "Your Taiyō account was deleted", react: <AccountDeletedEmail name={name} /> }
  }

  const { url } = email

  if (email.kind === "delete-account") {
    return {
      subject: "Confirm the deletion of your Taiyō account",
      react: <DeleteAccountEmail expiresInMinutes={email.expiresInMinutes} name={name} url={url} />,
    }
  }

  if (email.kind === "reset-password") {
    return {
      subject: "Reset your password",
      react: <ResetPasswordEmail name={name} url={url} />,
    }
  }

  if (email.kind === "verify-email") {
    return { subject: "Verify your email", react: <SignUpEmail name={name} url={url} /> }
  }

  if (email.kind === "change-email") {
    return {
      subject: "Confirm your email change",
      react: <ChangeEmailEmail name={name} newEmail={email.newEmail} url={url} />,
    }
  }

  return { subject: "Your magic link for Taiyō", react: <MagicLinkEmail name={name} url={url} /> }
}

export const sendAuthEmail = (email: AuthEmail) => sendEmail({ to: email.to, ...toMessage(email) })
