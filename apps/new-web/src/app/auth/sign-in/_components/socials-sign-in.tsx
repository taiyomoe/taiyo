import { useSetAtom } from "jotai"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { signInFlowStepAtom } from "~/atoms/sign-in-flow.atoms"
import { Button } from "~/components/ui/button"
import { DiscordButton } from "~/components/ui/discord-button"
import { GoogleButton } from "~/components/ui/google-button"
import { Separator } from "~/components/ui/separator"

export const SocialsSignIn = () => {
  const setStep = useSetAtom(signInFlowStepAtom)
  const t = useTranslations()

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <GoogleButton />
        <DiscordButton />
      </div>
      <Separator className="w-full bg-emphasis">{t("global.or")}</Separator>
      <div className="space-y-2">
        <Button variant="outline" onPress={() => setStep(1)}>
          {t("auth.email")}
        </Button>
        <Button variant="outline" onPress={() => setStep(2)}>
          {t("auth.username")}
        </Button>
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
