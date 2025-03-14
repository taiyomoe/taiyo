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
import { PasswordField } from "~/components/fields/password-field"
import { TextField } from "~/components/fields/text-field"
import { BackButton } from "~/components/ui/back-button"
import { Form } from "~/components/ui/form"
import { GradientButton } from "~/components/ui/gradient-button"
import { SubmitButton } from "~/components/ui/submit-button"
import { env } from "~/env"
import {
  type SignInUsernameInput,
  signInUsernameSchema,
} from "~/schemas/users.schemas"
import { authMessages } from "~/utils/auth-messages"

export const SignInFormUsername = () => {
  const setStep = useSetAtom(signInFlowStepAtom)
  const router = useRouter()
  const t = useTranslations()
  const form = useForm({
    resolver: zodResolver(signInUsernameSchema),
    mode: "onTouched",
    defaultValues: {
      username: "",
      password: "",
      turnstileToken: "",
    },
  })

  const handlePress = async (values: SignInUsernameInput) => {
    const { data, error } = await authClient.signIn.username({
      ...pick(values, ["username", "password"]),
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
        <TextField
          control={form.control}
          name="username"
          label={t("global.username")}
          placeholder="rdxx"
        />
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
