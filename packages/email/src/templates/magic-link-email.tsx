import { Button, Container, Section, Text } from "react-email"
import EmailBase from "../components/email-base"
import { emailStyles } from "../theme"

type Props = {
  name: string
  url: string
}

const MagicLinkEmail = ({ name, url }: Props) => (
  <EmailBase preview="Your magic link for Taiyō">
    <Container style={emailStyles.body}>
      <Text style={emailStyles.title}>Your magic link</Text>
      <Text>
        Hi {name}, your will find the magic link your requested below. This link will be valid for 1
        hour.
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

export default MagicLinkEmail
