import { SignUpEmail, resend } from "@taiyomoe/email"
import type { User } from "better-auth"

export const sendVerificationEmail = async (data: {
  user: User
  url: string
  token: string
}) => {
  await resend.emails.send({
    from: "Taiyō <no-reply@taiyo.moe>",
    to: data.user.email,
    subject: "Verify your email",
    react: <SignUpEmail name={data.user.name} url={data.url} />,
  })
}
