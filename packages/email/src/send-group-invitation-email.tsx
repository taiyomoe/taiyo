import { sendEmail } from "./client"
import GroupInvitationEmail from "./templates/group-invitation-email"

export type GroupInvitationMail = {
  to: string
  name: string
  inviterName: string
  groupName: string
  expiresInDays: number
  url: string | null
}

export const sendGroupInvitationEmail = ({ to, ...props }: GroupInvitationMail) =>
  sendEmail({
    to,
    subject: `${props.inviterName} invited you to join ${props.groupName} on Taiyō`,
    react: <GroupInvitationEmail {...props} />,
  })
