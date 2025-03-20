import { ArrowRightIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { AuthDiscordButton } from "~/app/auth/_components/auth-discord-button"
import { AuthGoogleButton } from "~/app/auth/_components/auth-google-button"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { ShineButton } from "~/components/ui/shine-button"
import { useAuthStore } from "~/stores/auth-flow.store"

export const SignInSocials = () => {
  const { goToStep } = useAuthStore()
  const t = useTranslations()

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <AuthGoogleButton />
        <AuthDiscordButton />
      </div>
      <Separator className="w-full bg-emphasis">{t("global.or")}</Separator>
      <div className="space-y-2">
        <ShineButton
          className="hover:[&_svg]:translate-x-1"
          onPress={() => goToStep("magicLink")}
        >
          {t("auth.magicLink")}
          <ArrowRightIcon />
        </ShineButton>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onPress={() => goToStep("email")}>
            {t("auth.email")}
          </Button>
          <Button variant="outline" onPress={() => goToStep("username")}>
            {t("auth.username")}
          </Button>
        </div>
        <Link
          href="/auth/sign-up"
          className="mt-2 block text-center text-sm text-subtle hover:underline"
        >
          {t("auth.signIn.action")}
        </Link>
      </div>
    </div>
  )
}
