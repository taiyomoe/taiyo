import { authClient } from "@taiyomoe/auth/client"
import { DiscordButton } from "~/components/ui/discord-button"

export const AuthDiscordButton = () => {
  const handlePress = async () => {
    await authClient.signIn.social({ provider: "discord" })
  }

  return <DiscordButton onPress={handlePress} />
}
