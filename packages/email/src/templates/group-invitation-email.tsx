import { Button, Container, Section, Text } from "react-email"
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
  <EmailBase preview={`${inviterName} invited you to join ${groupName} on Taiyō`}>
    <Container style={emailStyles.body}>
      <Text style={emailStyles.title}>You're invited to join {groupName}</Text>
      <Text>
        Hi {name}, {inviterName} invited you to join the group {groupName} on Taiyō. You can accept
        or decline the invitation from your dashboard. It expires in {expiresInDays} days.
      </Text>
      {url === null ? null : (
        <>
          <Section>
            <Button href={url} style={emailStyles.button}>
              View invitation
            </Button>
          </Section>
          <Text>
            If the button does not work, copy and paste the link below into your browser: {url}
          </Text>
        </>
      )}
    </Container>
    <Container style={emailStyles.footer}>
      <Text>
        If you don't know this group, you can ignore this email or decline the invitation.
      </Text>
    </Container>
  </EmailBase>
)

export default GroupInvitationEmail
