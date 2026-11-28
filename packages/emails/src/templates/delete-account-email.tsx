import { Text } from "react-email"
import EmailAction from "../components/email-action"
import EmailBase from "../components/email-base"
import { emailStyles } from "../theme"

type Props = {
  name: string
  url: string
  expiresInMinutes: number
}

const DeleteAccountEmail = ({ name, url, expiresInMinutes }: Props) => (
  <EmailBase
    preview="Confirm that you want to delete your Taiyō account"
    footer="If you did not ask to delete your account, ignore this email, change your password and sign out of your other sessions. Nothing is deleted until the link is used."
  >
    <Text style={emailStyles.title}>Delete your account</Text>
    <Text style={emailStyles.text}>
      Hi {name}, you asked to delete your Taiyō account. The link below opens a page where you
      confirm it, while signed in. Once confirmed, your account and your personal data are deleted
      right away and cannot be recovered. The link works for {expiresInMinutes} minutes.
    </Text>
    <EmailAction href={url} label="Delete my account" />
  </EmailBase>
)

export default DeleteAccountEmail
