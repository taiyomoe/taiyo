import { Button, Container, Section, Text } from "react-email"
import EmailBase from "../components/email-base"

type Props = {
  name: string
  url: string
}

const SignUpEmail = ({ name, url }: Props) => (
  <EmailBase preview="Verify your account on Taiyō">
    <Container className="px-8 py-4">
      <Text className="text-2xl font-bold">Verify your email</Text>
      <Text>
        Hi {name}, thank you for your interest in Taiyō. We want to ensure that it&apos;s really you
        who created your account, please click the button below. This link will be valid for 1 hour.
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

export default SignUpEmail
