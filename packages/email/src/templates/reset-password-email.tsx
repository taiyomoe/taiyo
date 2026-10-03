import { Button, Container, Section, Text } from "react-email"
import EmailBase from "../components/email-base"
import { emailStyles } from "../theme"

type Props = {
  name: string
  url: string
}

const ResetPasswordEmail = ({ name, url }: Props) => (
  <EmailBase preview="Reset your password on Taiyō">
    <Container style={emailStyles.body}>
      <Text style={emailStyles.title}>Reset your password</Text>
      <Text>
        Hi {name}, we received a request to reset your password. Please click the button below to
        reset it. This link will be valid for 1 hour.
      </Text>
      <Section>
        <Button href={url} style={emailStyles.button}>
          Click here
        </Button>
      </Section>
      <Text>
        If the button does not work, copy and paste the link below into your browser: {url}
      </Text>
    </Container>
    <Container style={emailStyles.footer}>
      <Text>If you did not request this email, please ignore it as nothing will be changed.</Text>
    </Container>
  </EmailBase>
)

export default ResetPasswordEmail
