import { zodResolver } from "@hookform/resolvers/zod"
import { Turnstile } from "@marsidev/react-turnstile"
import { authClient } from "@taiyomoe/auth/client"
import type { InferNestedPaths } from "@taiyomoe/types"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { EmailField } from "~/components/fields/email-field"
import { BackButton } from "~/components/ui/back-button"
import { Form } from "~/components/ui/form"
import { env } from "~/env"
import {
  type SignInMagicLinkInput,
  signInMagicLinkSchema,
} from "~/schemas/users.schemas"
import { useAuthStore } from "~/stores/auth.store"
import { authMessages } from "~/utils/auth-messages"
import { SignInButton } from "./sign-in-button"

export const SignInFormMagicLink = () => {
  const { goToStep, goToSocials } = useAuthStore()
  const t = useTranslations()
  const form = useForm({
    resolver: zodResolver(signInMagicLinkSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      turnstileToken: "",
    },
  })

  const handlePress = async (values: SignInMagicLinkInput) => {
    const { error } = await authClient.signIn.magicLink({
      email: values.email,
      fetchOptions: {
        headers: { "x-captcha-response": values.turnstileToken },
      },
    })

    if (error) {
      toast.error(
        error.code && error.code in authMessages
          ? t(authMessages[error.code as InferNestedPaths<typeof authMessages>])
          : t("auth.signIn.error"),
      )

      return
    }

    goToStep("magicLinkSent")
  }

  return (
    <div className="space-y-8">
      <BackButton onPress={goToSocials} />
      <Form {...form} onSubmit={handlePress}>
        <EmailField control={form.control} name="email" />
        <Turnstile
          className="min-h-20"
          siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          onSuccess={(token) => form.setValue("turnstileToken", token)}
          options={{ size: "flexible" }}
        />
        <SignInButton />
      </Form>
    </div>
  )
}
