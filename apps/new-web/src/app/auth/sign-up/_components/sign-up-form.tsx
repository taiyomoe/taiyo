import { zodResolver } from "@hookform/resolvers/zod"
import { Turnstile } from "@marsidev/react-turnstile"
import { authClient } from "@taiyomoe/auth/client"
import { useTranslations } from "next-intl"
import { pick } from "radash"
import { useForm } from "react-hook-form"
import { AuthSubmitButton } from "~/app/auth/_components/auth-submit-button"
import { useHandleAuthError } from "~/app/hooks/use-handle-auth-error"
import { EmailField } from "~/components/fields/email-field"
import { PasswordField } from "~/components/fields/password-field"
import { TextField } from "~/components/fields/text-field"
import { BackButton } from "~/components/ui/back-button"
import { Form } from "~/components/ui/form"
import { env } from "~/env"
import { type SignUpInput, signUpSchema } from "~/schemas/users.schemas"
import { useAuthStore } from "~/stores/auth.store"

export const SignUpForm = () => {
  const { goToStep, goToSocials } = useAuthStore()
  const { handleError } = useHandleAuthError()
  const t = useTranslations()
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      turnstileToken: "",
    },
  })

  const handlePress = async (values: SignUpInput) => {
    await authClient.signUp.email({
      ...pick(values, ["email", "username", "password"]),
      name: values.username,
      fetchOptions: {
        headers: { "x-captcha-response": values.turnstileToken },
        onSuccess: () => goToStep("verificationEmailSent"),
        onError: handleError("signUp.error"),
      },
    })
  }

  return (
    <div className="space-y-8">
      <BackButton onPress={goToSocials} />
      <Form {...form} onSubmit={handlePress}>
        <TextField
          control={form.control}
          name="username"
          label={t("global.username")}
          placeholder="rdx"
        />
        <EmailField control={form.control} name="email" />
        <PasswordField control={form.control} name="password" showStrength />
        <PasswordField
          control={form.control}
          name="confirmPassword"
          label={t("global.confirmPassword")}
        />
        <Turnstile
          className="min-h-20"
          siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          onSuccess={(token) => form.setValue("turnstileToken", token)}
          options={{ size: "flexible" }}
        />
        <AuthSubmitButton label="signUp.title" />
      </Form>
    </div>
  )
}
