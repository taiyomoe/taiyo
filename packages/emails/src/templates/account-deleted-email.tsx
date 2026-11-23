import { Text } from "react-email"
import EmailBase from "../components/email-base"
import { emailStyles } from "../theme"

type Props = {
  name: string
}

const AccountDeletedEmail = ({ name }: Props) => (
  <EmailBase
    preview="Your Taiyō account was deleted"
    footer="This is the last email Taiyō sends to this address."
  >
    <Text style={emailStyles.title}>Your account was deleted</Text>
    <Text style={emailStyles.text}>
      Hi {name}, your Taiyō account and your personal data were deleted. The chapters you uploaded
      and the titles you added stay on the site under &quot;Deleted user&quot;. Thank you for
      reading with us.
    </Text>
  </EmailBase>
)

export default AccountDeletedEmail
