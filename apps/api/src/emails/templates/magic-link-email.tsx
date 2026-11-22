import { Text } from "react-email"
import EmailAction from "../components/email-action"
import EmailBase from "../components/email-base"
import { emailStyles } from "../theme"

type Props = {
  name: string
  url: string
}

const MagicLinkEmail = ({ name, url }: Props) => (
  <EmailBase
    preview="Your magic link for Taiyō"
    footer="If you did not request this link, you can ignore this email."
  >
    <Text style={emailStyles.title}>Your magic link</Text>
    <Text style={emailStyles.text}>
      Hi {name}, here is the sign-in link you requested. It is valid for 1 hour.
    </Text>
    <EmailAction href={url} label="Sign in to Taiyō" />
  </EmailBase>
)

export default MagicLinkEmail
