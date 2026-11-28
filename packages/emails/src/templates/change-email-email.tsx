import { Text } from "react-email"
import EmailAction from "../components/email-action"
import EmailBase from "../components/email-base"
import { emailStyles } from "../theme"

type Props = {
  name: string
  newEmail: string
  url: string
}

const ChangeEmailEmail = ({ name, newEmail, url }: Props) => (
  <EmailBase
    preview="Confirm your new email on Taiyō"
    footer="If you did not request this change, ignore this email and change your password: your email will stay the same."
  >
    <Text style={emailStyles.title}>Confirm your email change</Text>
    <Text style={emailStyles.text}>
      Hi {name}, we received a request to change the email of your Taiyō account to {newEmail}.
      Approve it below, and we will then send a link to the new address to verify it.
    </Text>
    <EmailAction href={url} label="Approve the change" />
  </EmailBase>
)

export default ChangeEmailEmail
