import { resend } from "./client"
import GroupInvitationEmail from "./templates/group-invitation-email"

export type GroupInvitationMail = {
  to: string
  name: string
  inviterName: string
  groupName: string
  expiresInDays: number
  url: string | null
}

export const sendGroupInvitationEmail = async ({ to, ...props }: GroupInvitationMail) => {
  const { error } = await resend.emails.send({
    from: "Taiyō <no-reply@taiyo.moe>",
    to,
    subject: `${props.inviterName} invited you to join ${props.groupName} on Taiyō`,
    react: <GroupInvitationEmail {...props} />,
  })

  if (error !== null) {
    throw new Error(error.message)
  }
}
