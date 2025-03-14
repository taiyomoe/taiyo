import { zodResolver } from "@hookform/resolvers/zod"
import { Turnstile } from "@marsidev/react-turnstile"
import { authClient } from "@taiyomoe/auth/client"
import type { InferNestedPaths } from "@taiyomoe/types"
import { useSetAtom } from "jotai"
import { ArrowRightIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { pick } from "radash"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { signUpFlowStepAtom } from "~/atoms/auth-flow.atoms"
import { EmailField } from "~/components/fields/email-field"
import { PasswordField } from "~/components/fields/password-field"
import { TextField } from "~/components/fields/text-field"
import { BackButton } from "~/components/ui/back-button"
import { Form } from "~/components/ui/form"
import { GradientButton } from "~/components/ui/gradient-button"
import { SubmitButton } from "~/components/ui/submit-button"
import { env } from "~/env"
import { type SignUpInput, signUpSchema } from "~/schemas/users.schemas"
import { authMessages } from "~/utils/auth-messages"

export const SignUpForm = () => {
  const setStep = useSetAtom(signUpFlowStepAtom)
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
    const { error } = await authClient.signUp.email({
      ...pick(values, ["email", "username", "password"]),
      name: values.username,
      fetchOptions: {
        headers: { "x-captcha-response": values.turnstileToken },
      },
    })

    if (error) {
      if (error.code && error.code in authMessages)
        toast.error(
          t(authMessages[error.code as InferNestedPaths<typeof authMessages>]),
        )
      else toast.error(t("auth.signUp.error"))

      return
    }
    toast.success(t("auth.signUp.success"))

    setStep(2)
  }

  return (
    <div className="space-y-8">
      <BackButton onPress={() => setStep(0)} />
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
        <SubmitButton asChild>
          <GradientButton className="mt-6 hover:[&_svg]:translate-x-1">
            {t("auth.signUp.title")}
            <ArrowRightIcon />
          </GradientButton>
        </SubmitButton>
      </Form>
    </div>
  )
}
