import { useSetAtom } from "jotai"
import { useTranslations } from "next-intl"
import { signInFlowStepAtom } from "~/atoms/sign-in-flow.atoms"
import { MailSentIllustration } from "~/components/illustrations/mail-sent-illustration"
import { BackButton } from "~/components/ui/back-button"

export const VerificationEmailSent = () => {
  const setStep = useSetAtom(signInFlowStepAtom)
  const t = useTranslations("auth.verificationEmailSent")

  return (
    <div className="space-y-8">
      <BackButton onPress={() => setStep(0)} />
      <div className="relative flex flex-col items-center justify-center gap-2">
        <MailSentIllustration className="mb-6 h-fit w-44 sm:w-56" />
        <h1 className="font-bold text-2xl">{t("title")}</h1>
        <h2 className="text-center text-subtle">{t("description1")}</h2>
        <p className="text-center text-sm text-subtle">{t("description2")}</p>
      </div>
    </div>
  )
}
