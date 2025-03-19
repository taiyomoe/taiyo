import { zodResolver } from "@hookform/resolvers/zod"
import { authClient } from "@taiyomoe/auth/client"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { AuthSubmitButton } from "~/app/auth/_components/auth-submit-button"
import { useHandleAuthError } from "~/app/hooks/use-handle-auth-error"
import { EmailField } from "~/components/fields/email-field"
import { TurnstileField } from "~/components/fields/turnstile-field"
import { BackArrowButton } from "~/components/ui/back-arrow-button"
import { Form } from "~/components/ui/form"
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
} from "~/schemas/users.schemas"
import { useAuthStore } from "~/stores/auth-flow.store"

export const ForgotPasswordForm = () => {
  const { goToStep, goToSocials } = useAuthStore()
  const { handleError } = useHandleAuthError()
  const t = useTranslations("auth.forgotPassword")
  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      turnstileToken: "",
    },
  })

  const handlePress = async (values: ForgotPasswordInput) => {
    await authClient.forgetPassword({
      email: values.email,
      redirectTo: "/auth/reset-password",
      fetchOptions: {
        headers: { "x-captcha-response": values.turnstileToken },
        onSuccess: () => goToStep("resetPasswordEmailSent"),
        onError: handleError("forgotPassword.error"),
      },
    })
  }

  return (
    <div className="space-y-8">
      <BackArrowButton onPress={goToSocials} />
      <div className="space-y-2">
        <h1 className="font-bold text-2xl">{t("title")}</h1>
        <p className="text-sm text-subtle">{t("description")}</p>
      </div>
      <Form {...form} onSubmit={handlePress}>
        <EmailField control={form.control} name="email" />
        <TurnstileField control={form.control} name="turnstileToken" />
        <AuthSubmitButton label="forgotPassword.action" />
      </Form>
    </div>
  )
}
