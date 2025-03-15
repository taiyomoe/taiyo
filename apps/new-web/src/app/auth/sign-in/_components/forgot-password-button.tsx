import { useTranslations } from "next-intl"
import { Button } from "react-aria-components"
import { useAuthStore } from "~/stores/auth.store"

export const ForgotPasswordButton = () => {
  const { goToStep } = useAuthStore()
  const t = useTranslations("auth.forgotPassword")

  return (
    <Button
      className="transition hover:text-subtle"
      onPress={() => goToStep("forgotPassword")}
      excludeFromTabOrder
    >
      {t("title")}
    </Button>
  )
}
