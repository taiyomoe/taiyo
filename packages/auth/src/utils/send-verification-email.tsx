import type { User } from "better-auth"
import { resend, SignUpEmail } from "@taiyomoe/email"

export const sendVerificationEmail = async (data: { user: User; url: string; token: string }) => {
  await resend.emails.send({
    from: "Taiyō <no-reply@taiyo.moe>",
    to: data.user.email,
    subject: "Verify your email",
    react: <SignUpEmail name={data.user.name} url={data.url} />,
  })
}
