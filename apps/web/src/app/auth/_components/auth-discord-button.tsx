import { authClient } from "@taiyomoe/auth/client"
import { useTranslations } from "next-intl"
import { DiscordButton } from "~/components/ui/discord-button"

export const AuthDiscordButton = () => {
  const t = useTranslations("auth")

  const handlePress = async () => {
    await authClient.signIn.social({ provider: "discord" })
  }

  return <DiscordButton onPress={handlePress}>{t("discord")}</DiscordButton>
}
