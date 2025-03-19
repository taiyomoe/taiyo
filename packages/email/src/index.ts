import { Resend } from "resend"
import { env } from "./env"
import MagicLinkEmail from "./templates/magic-link-email"
import ResetPasswordEmail from "./templates/reset-password-email"
import SignUpEmail from "./templates/sign-up-email"

export const resend = new Resend(env.RESEND_API_KEY)

export { MagicLinkEmail, ResetPasswordEmail, SignUpEmail }
