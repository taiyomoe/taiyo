import { Button, Container, Section, Text } from "react-email"
import EmailBase from "../components/email-base"
import { emailStyles } from "../theme"

type Props = {
  name: string
  url: string
}

const SignUpEmail = ({ name, url }: Props) => (
  <EmailBase preview="Verify your account on Taiyō">
    <Container style={emailStyles.body}>
      <Text style={emailStyles.title}>Verify your email</Text>
      <Text>
        Hi {name}, thank you for your interest in Taiyō. We want to ensure that it&apos;s really you
        who created your account, please click the button below. This link will be valid for 1 hour.
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
      <Text>If you did not request this email, please ignore it.</Text>
    </Container>
  </EmailBase>
)

export default SignUpEmail
