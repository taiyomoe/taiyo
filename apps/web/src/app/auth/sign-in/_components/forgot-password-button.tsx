import { useTranslations } from "next-intl"
import { useAuthStore } from "~/stores/auth-flow.store"

export const ForgotPasswordButton = () => {
  const { goToStep } = useAuthStore()
  const t = useTranslations("auth.forgotPassword")

  return (
    <button
      className="transition hover:text-subtle"
      onClick={() => goToStep("forgotPassword")}
      tabIndex={-1}
      type="button"
    >
      {t("title")}
    </button>
  )
}
