import { zodResolver } from "@hookform/resolvers/zod"
import { authClient } from "@taiyomoe/auth/client"
import { useForm } from "react-hook-form"
import { useHandleAuthError } from "~/app/hooks/use-handle-auth-error"
import { EmailField } from "~/components/fields/email-field"
import { TurnstileField } from "~/components/fields/turnstile-field"
import { BackButton } from "~/components/ui/back-button"
import { Form } from "~/components/ui/form"
import {
  type SignInMagicLinkInput,
  signInMagicLinkSchema,
} from "~/schemas/users.schemas"
import { useAuthStore } from "~/stores/auth.store"
import { AuthSubmitButton } from "../../_components/auth-submit-button"

export const SignInFormMagicLink = () => {
  const { goToStep, goToSocials } = useAuthStore()
  const { handleError } = useHandleAuthError()
  const form = useForm({
    resolver: zodResolver(signInMagicLinkSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      turnstileToken: "",
    },
  })

  const handlePress = async (values: SignInMagicLinkInput) => {
    await authClient.signIn.magicLink({
      email: values.email,
      fetchOptions: {
        headers: { "x-captcha-response": values.turnstileToken },
        onSuccess: () => goToStep("magicLinkSent"),
        onError: handleError("signIn.error"),
      },
    })
  }

  return (
    <div className="space-y-8">
      <BackButton onPress={goToSocials} />
      <Form {...form} onSubmit={handlePress}>
        <EmailField control={form.control} name="email" />
        <TurnstileField control={form.control} name="turnstileToken" />
        <AuthSubmitButton label="signIn.title" />
      </Form>
    </div>
  )
}
