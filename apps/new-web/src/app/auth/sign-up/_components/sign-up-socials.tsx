import { useTranslations } from "next-intl"
import Link from "next/link"
import { AuthDiscordButton } from "~/app/auth/_components/auth-discord-button"
import { AuthGoogleButton } from "~/app/auth/_components/auth-google-button"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { useAuthStore } from "~/stores/auth-flow.store"

export const SignUpSocials = () => {
  const { goToStep } = useAuthStore()
  const t = useTranslations()

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <AuthGoogleButton />
        <AuthDiscordButton />
      </div>
      <Separator className="w-full bg-emphasis">{t("global.or")}</Separator>
      <div className="space-y-4">
        <Button variant="outline" onPress={() => goToStep("email")}>
          {t("auth.email")}
        </Button>
        <Link
          href="/auth/sign-in"
          className="block text-center text-sm text-subtle hover:underline"
        >
          {t("auth.signUp.action")}
        </Link>
      </div>
    </div>
  )
}
