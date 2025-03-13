import { zodResolver } from "@hookform/resolvers/zod"
import { Turnstile } from "@marsidev/react-turnstile"
import { authClient } from "@taiyomoe/auth/client"
import type { InferNestedPaths } from "@taiyomoe/types"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { pick } from "radash"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { EmailField } from "~/components/fields/email-field"
import { PasswordField } from "~/components/fields/password-field"
import { TextField } from "~/components/fields/text-field"
import { BackButton } from "~/components/ui/back-button"
import { Form } from "~/components/ui/form"
import { SubmitButton } from "~/components/ui/submit-button"
import { env } from "~/env"
import { type SignUpInput, signUpSchema } from "~/schemas/users.schemas"
import { authMessages } from "~/utils/auth-messages"

type Props = {
  toggleSocials: () => void
}

export const SignUpForm = ({ toggleSocials }: Props) => {
  const t = useTranslations()
  const router = useRouter()
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

    if (error?.code && error.code in authMessages) {
      toast.error(
        t(authMessages[error.code as InferNestedPaths<typeof authMessages>]),
      )

      return
    }

    toast.success(t("auth.signUp.success"))
    router.push("/auth/sign-in")
  }

  return (
    <div className="space-y-8">
      <BackButton onPress={toggleSocials} />
      <Form {...form} onSubmit={handlePress} className="">
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
        />
        <SubmitButton className="mt-6">{t("auth.signUp.title")}</SubmitButton>
      </Form>
    </div>
  )
}
