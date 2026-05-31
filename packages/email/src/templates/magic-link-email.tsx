import { Button, Container, Section, Text } from "@react-email/components"
import EmailBase from "../components/email-base"

type Props = {
  name: string
  url: string
}

const MagicLinkEmail = ({ name, url }: Props) => (
  <EmailBase preview="Your magic link for Taiyō">
    <Container className="px-8 py-4">
      <Text className="text-2xl font-bold">Your magic link</Text>
      <Text>
        Hi {name}, your will find the magic link your requested below. This link will be valid for 1
        hour.
      </Text>
      <Section>
        <Button href={url} className="rounded-md bg-primary px-3 py-1.5 text-sm text-white">
          Click here
        </Button>
      </Section>
      <Text>
        If the button does not work, copy and paste the link below into your browser: {url}
      </Text>
    </Container>
    <Container className="border-t border-solid border-border px-8">
      <Text>If you did not request this email, please ignore it.</Text>
    </Container>
  </EmailBase>
)

export default MagicLinkEmail
