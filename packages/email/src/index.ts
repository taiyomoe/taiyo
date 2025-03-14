import { Resend } from "resend"
import { env } from "./env"
import SignUpEmail from "./templates/sign-up-email"

export const resend = new Resend(env.RESEND_API_KEY)

export { SignUpEmail }
