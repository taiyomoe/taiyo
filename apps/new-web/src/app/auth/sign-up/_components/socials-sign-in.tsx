import { useTranslations } from "next-intl"
import { Button } from "~/components/ui/button"
import { DiscordButton } from "~/components/ui/discord-button"
import { GoogleButton } from "~/components/ui/google-button"
import { Separator } from "~/components/ui/separator"

type Props = {
  toggleEmail: () => void
}

export const SocialsSignIn = ({ toggleEmail }: Props) => {
  const t = useTranslations()

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <GoogleButton />
        <DiscordButton />
      </div>
      <Separator className="w-full bg-emphasis">{t("global.or")}</Separator>
      <div className="space-y-2">
        <Button variant="outline" onPress={toggleEmail} className="mt-8">
          {t("auth.email")}
        </Button>
      </div>
    </div>
  )
}
