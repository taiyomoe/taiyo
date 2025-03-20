import { authClient } from "@taiyomoe/auth/client"
import { GoogleButton } from "~/components/ui/google-button"

export const AuthGoogleButton = () => {
  const handlePress = async () => {
    await authClient.signIn.social({ provider: "google" })
  }

  return <GoogleButton onPress={handlePress} />
}
