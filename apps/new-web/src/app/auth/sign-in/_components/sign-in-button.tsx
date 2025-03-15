import { ArrowRightIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { GradientButton } from "~/components/ui/gradient-button"
import { SubmitButton } from "~/components/ui/submit-button"

export const SignInButton = () => {
  const t = useTranslations("auth.signIn")

  return (
    <SubmitButton asChild>
      <GradientButton className="mt-6 hover:[&_svg]:translate-x-1">
        {t("title")}
        <ArrowRightIcon />
      </GradientButton>
    </SubmitButton>
  )
}
