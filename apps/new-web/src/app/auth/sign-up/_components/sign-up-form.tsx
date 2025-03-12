import { zodResolver } from "@hookform/resolvers/zod"
import { Turnstile } from "@marsidev/react-turnstile"
import { authClient } from "@taiyomoe/auth/client"
import { useTranslations } from "next-intl"
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

type Props = {
  toggleSocials: () => void
}

export const SignUpForm = ({ toggleSocials }: Props) => {
  const t = useTranslations()
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      turnstileToken: "",
    },
  })

  const handlePress = async (values: SignUpInput) => {
    const data = await authClient.signUp.email({
      ...pick(values, ["email", "name", "password"]),
      fetchOptions: {
        headers: { "x-captcha-response": values.turnstileToken },
      },
    })

    if (data.error) {
      toast.error("Ocorreu um erro inesperado ao tentar logar com o Discord")
      console.error(data.error)
    }
  }

  return (
    <div className="space-y-8">
      <BackButton onPress={toggleSocials} />
      <Form {...form} onSubmit={handlePress} className="">
        <TextField
          control={form.control}
          name="name"
          label={t("global.username")}
          placeholder="rdxx"
        />
        <EmailField control={form.control} name="email" />
        <PasswordField
          control={form.control}
          name="password"
          label={t("global.password")}
          showStrength
        />

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
        <SubmitButton className="mt-6">{t("auth.signUp")}</SubmitButton>
      </Form>
    </div>
  )
}
