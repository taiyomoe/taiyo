import { useSetAtom } from "jotai"
import { useTranslations } from "next-intl"
import { Button } from "react-aria-components"
import { signInFlowStepAtom } from "~/atoms/auth-flow.atoms"

export const ForgotPasswordButton = () => {
  const setStep = useSetAtom(signInFlowStepAtom)
  const t = useTranslations("auth.forgotPassword")

  return (
    <Button
      className="transition hover:text-subtle"
      onPress={() => setStep(4)}
      excludeFromTabOrder
    >
      {t("title")}
    </Button>
  )
}
