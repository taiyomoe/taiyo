import { Text } from "react-email"
import EmailAction from "../components/email-action"
import EmailBase from "../components/email-base"
import { emailStyles } from "../theme"

type Props = {
  name: string
  url: string
}

const ResetPasswordEmail = ({ name, url }: Props) => (
  <EmailBase
    preview="Reset your password on Taiyō"
    footer="If you did not request this email, you can ignore it: your password will stay the same."
  >
    <Text style={emailStyles.title}>Reset your password</Text>
    <Text style={emailStyles.text}>
      Hi {name}, we received a request to reset the password of your Taiyō account. The link is
      valid for 1 hour.
    </Text>
    <EmailAction href={url} label="Reset my password" />
  </EmailBase>
)

export default ResetPasswordEmail
