import { Text } from "react-email"
import EmailAction from "../components/email-action"
import EmailBase from "../components/email-base"
import { emailStyles } from "../theme"

type Props = {
  name: string
  expiresInDays: number
  url: string | null
}

const DataExportReadyEmail = ({ name, expiresInDays, url }: Props) => (
  <EmailBase
    preview="Your Taiyō data is ready to download"
    footer="If you did not ask for a copy of your data, change your password and sign out of your other sessions."
  >
    <Text style={emailStyles.title}>Your data is ready</Text>
    <Text style={emailStyles.text}>
      Hi {name}, the copy of your Taiyō data you asked for is ready. Download it from your privacy
      settings: you need to be signed in. It will be deleted in {expiresInDays} days.
    </Text>
    {url === null ? null : <EmailAction href={url} label="Open privacy settings" />}
  </EmailBase>
)

export default DataExportReadyEmail
