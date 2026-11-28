import { Text } from "react-email"
import EmailAction from "../components/email-action"
import EmailBase from "../components/email-base"
import { emailStyles } from "../theme"

type Props = {
  name: string
  inviterName: string
  groupName: string
  expiresInDays: number
  url: string | null
}

const GroupInvitationEmail = ({ name, inviterName, groupName, expiresInDays, url }: Props) => (
  <EmailBase
    preview={`${inviterName} invited you to join ${groupName} on Taiyō`}
    footer="If you don't know this group, you can ignore this email or decline the invitation."
  >
    <Text style={emailStyles.title}>You're invited to join {groupName}</Text>
    <Text style={emailStyles.text}>
      Hi {name}, {inviterName} invited you to join the group {groupName} on Taiyō. You can accept or
      decline the invitation from your dashboard. It expires in {expiresInDays} days.
    </Text>
    {url === null ? null : <EmailAction href={url} label="View invitation" />}
  </EmailBase>
)

export default GroupInvitationEmail
