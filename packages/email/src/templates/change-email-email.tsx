import { Button, Container, Section, Text } from "react-email"
import EmailBase from "../components/email-base"
import { emailStyles } from "../theme"

type Props = {
  name: string
  newEmail: string
  url: string
}

const ChangeEmailEmail = ({ name, newEmail, url }: Props) => (
  <EmailBase preview="Confirm your new email on Taiyō">
    <Container style={emailStyles.body}>
      <Text style={emailStyles.title}>Confirm your email change</Text>
      <Text>
        Hi {name}, we received a request to change the email of your Taiyō account to {newEmail}.
        Click the button below to approve it. We will then send a link to the new address to verify
        it.
      </Text>
      <Section>
        <Button href={url} style={emailStyles.button}>
          Approve the change
        </Button>
      </Section>
      <Text>
        If the button does not work, copy and paste the link below into your browser: {url}
      </Text>
    </Container>
    <Container style={emailStyles.footer}>
      <Text>
        If you did not request this change, ignore this email and change your password: your email
        will stay the same.
      </Text>
    </Container>
  </EmailBase>
)

export default ChangeEmailEmail
