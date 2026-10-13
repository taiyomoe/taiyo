import type { User } from "better-auth"
import { ResetPasswordEmail, resend } from "@taiyomoe/email"

export const sendResetPassword = async (data: { user: User; url: string; token: string }) => {
  await resend.emails.send({
    from: "Taiyō <no-reply@taiyo.moe>",
    to: data.user.email,
    subject: "Reset your password",
    react: <ResetPasswordEmail name={data.user.name} url={data.url} />,
  })
}
