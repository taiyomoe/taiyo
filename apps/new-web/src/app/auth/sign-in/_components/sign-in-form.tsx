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
import { BackButton } from "~/components/ui/back-button"
import { Form } from "~/components/ui/form"
import { SubmitButton } from "~/components/ui/submit-button"
import { env } from "~/env"
import { type SignInInput, signInSchema } from "~/schemas/users.schemas"
import { authMessages } from "~/utils/auth-messages"

type Props = {
  toggleSocials: () => void
}

export const SignInForm = ({ toggleSocials }: Props) => {
  const t = useTranslations()
  const router = useRouter()
  const form = useForm({
    resolver: zodResolver(signInSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
      turnstileToken: "",
    },
  })

  const handlePress = async (values: SignInInput) => {
    const { data, error } = await authClient.signIn.email({
      ...pick(values, ["email", "password"]),
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

    toast.success(t("auth.signIn.success", { username: data?.user.name }))
    router.push("/")
  }

  return (
    <div className="space-y-8">
      <BackButton onPress={toggleSocials} />
      <Form {...form} onSubmit={handlePress} className="">
        <EmailField control={form.control} name="email" />
        <PasswordField control={form.control} name="password" />
        <Turnstile
          className="min-h-20"
          siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          onSuccess={(token) => form.setValue("turnstileToken", token)}
          options={{ size: "flexible" }}
        />
        <SubmitButton className="mt-6">{t("auth.signIn.title")}</SubmitButton>
      </Form>
    </div>
  )
}
