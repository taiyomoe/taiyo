import { zodResolver } from "@hookform/resolvers/zod"
import { Turnstile } from "@marsidev/react-turnstile"
import { authClient } from "@taiyomoe/auth/client"
import { ArrowRightIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { EmailField } from "~/components/fields/email-field"
import { BackButton } from "~/components/ui/back-button"
import { Form } from "~/components/ui/form"
import { GradientButton } from "~/components/ui/gradient-button"
import { SubmitButton } from "~/components/ui/submit-button"
import { env } from "~/env"
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
} from "~/schemas/users.schemas"
import { useAuthStore } from "~/stores/auth.store"

export const ForgotPasswordForm = () => {
  const { goToSocials } = useAuthStore()
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
    const { error } = await authClient.forgetPassword({
      email: values.email,
      redirectTo: "/auth/reset-password",
      fetchOptions: {
        headers: { "x-captcha-response": values.turnstileToken },
      },
    })

    if (error) {
      toast.error(t("error"))

      return
    }

    toast.success(t("success"))
  }

  return (
    <div className="space-y-8">
      <BackButton onPress={goToSocials} />
      <div className="space-y-2">
        <h1 className="font-bold text-2xl">{t("title")}</h1>
        <p className="text-sm text-subtle">{t("description")}</p>
      </div>
      <Form {...form} onSubmit={handlePress}>
        <EmailField control={form.control} name="email" />
        <Turnstile
          className="min-h-20"
          siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          onSuccess={(token) => form.setValue("turnstileToken", token)}
          options={{ size: "flexible" }}
        />
        <SubmitButton asChild>
          <GradientButton className="mt-6 hover:[&_svg]:translate-x-1">
            {t("action")}
            <ArrowRightIcon />
          </GradientButton>
        </SubmitButton>
      </Form>
    </div>
  )
}
