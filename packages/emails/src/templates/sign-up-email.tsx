import { Text } from "react-email"
import EmailAction from "../components/email-action"
import EmailBase from "../components/email-base"
import { emailStyles } from "../theme"

type Props = {
  name: string
  url: string
}

const SignUpEmail = ({ name, url }: Props) => (
  <EmailBase
    preview="Verify your account on Taiyō"
    footer="If you did not create a Taiyō account, you can ignore this email."
  >
    <Text style={emailStyles.title}>Verify your email</Text>
    <Text style={emailStyles.text}>
      Hi {name}, welcome to Taiyō! To finish creating your account, confirm that this email address
      is yours. The link is valid for 1 hour.
    </Text>
    <EmailAction href={url} label="Verify my email" />
  </EmailBase>
)

export default SignUpEmail
