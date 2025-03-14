import { zodResolver } from "@hookform/resolvers/zod"
import { Turnstile } from "@marsidev/react-turnstile"
import { authClient } from "@taiyomoe/auth/client"
import type { InferNestedPaths } from "@taiyomoe/types"
import { useSetAtom } from "jotai"
import { ArrowRightIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { pick } from "radash"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { signInFlowStepAtom } from "~/atoms/auth-flow.atoms"
import { EmailField } from "~/components/fields/email-field"
import { PasswordField } from "~/components/fields/password-field"
import { BackButton } from "~/components/ui/back-button"
import { Form } from "~/components/ui/form"
import { GradientButton } from "~/components/ui/gradient-button"
import { SubmitButton } from "~/components/ui/submit-button"
import { env } from "~/env"
import {
  type SignInEmailInput,
  signInEmailSchema,
} from "~/schemas/users.schemas"
import { authMessages } from "~/utils/auth-messages"

export const SignInFormEmail = () => {
  const setStep = useSetAtom(signInFlowStepAtom)
  const t = useTranslations()
  const router = useRouter()
  const form = useForm({
    resolver: zodResolver(signInEmailSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
      turnstileToken: "",
    },
  })

  const handlePress = async (values: SignInEmailInput) => {
    const { data, error } = await authClient.signIn.email({
      ...pick(values, ["email", "password"]),
      fetchOptions: {
        headers: { "x-captcha-response": values.turnstileToken },
      },
    })

    if (error) {
      if (
        error.code === "EMAIL_NOT_VERIFIED" ||
        error.code === "VERIFICATION_EMAIL_ALREADY_SENT"
      ) {
        setStep(3)

        return
      }

      if (error.code && error.code in authMessages)
        toast.error(
          t(authMessages[error.code as InferNestedPaths<typeof authMessages>]),
        )
      else toast.error(t("auth.signIn.error"))

      return
    }

    toast.success(t("auth.signIn.success", { username: data?.user.name }))
    router.push("/")
  }

  return (
    <div className="space-y-8">
      <BackButton onPress={() => setStep(0)} />
      <Form {...form} onSubmit={handlePress}>
        <EmailField control={form.control} name="email" />
        <PasswordField control={form.control} name="password" />
        <Turnstile
          className="min-h-20"
          siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          onSuccess={(token) => form.setValue("turnstileToken", token)}
          options={{ size: "flexible" }}
        />
        <SubmitButton asChild>
          <GradientButton className="mt-6 hover:[&_svg]:translate-x-1">
            {t("auth.signIn.title")}
            <ArrowRightIcon />
          </GradientButton>
        </SubmitButton>
      </Form>
    </div>
  )
}
