import { ResetPasswordEmail, resend } from "@taiyomoe/email"
import type { User } from "better-auth"

export const sendResetPassword = async (data: {
  user: User
  url: string
  token: string
}) => {
  await resend.emails.send({
    from: "no-reply@taiyo.moe",
    to: data.user.email,
    subject: "Reset your password",
    react: <ResetPasswordEmail name={data.user.name} url={data.url} />,
  })
}
