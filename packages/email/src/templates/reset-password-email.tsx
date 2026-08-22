import { Button, Container, Section, Text } from "react-email"
import EmailBase from "../components/email-base"

type Props = {
  name: string
  url: string
}

const ResetPasswordEmail = ({ name, url }: Props) => (
  <EmailBase preview="Reset your password on Taiyō">
    <Container className="px-8 py-4">
      <Text className="text-2xl font-bold">Reset your password</Text>
      <Text>
        Hi {name}, we received a request to reset your password. Please click the button below to
        reset it. This link will be valid for 1 hour.
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
      <Text>If you did not request this email, please ignore it as nothing will be changed.</Text>
    </Container>
  </EmailBase>
)

export default ResetPasswordEmail
