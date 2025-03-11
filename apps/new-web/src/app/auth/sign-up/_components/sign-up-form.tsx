import { zodResolver } from "@hookform/resolvers/zod"
import { Turnstile } from "@marsidev/react-turnstile"
import { authClient } from "@taiyomoe/auth/client"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { PasswordField } from "~/components/fields/password-field"
import { TextField } from "~/components/fields/text-field"
import { BackButton } from "~/components/ui/back-button"
import { Form } from "~/components/ui/form"
import { SubmitButton } from "~/components/ui/submit-button"
import { env } from "~/env"

const formSchema = z.object({
  username: z.string().min(1).max(20),
  email: z.string().max(100).email(),
  password: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
  turnstileToken: z.string(),
})

type Props = {
  toggleSocials: () => void
}

export const SignUpForm = ({ toggleSocials }: Props) => {
  const t = useTranslations()
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      turnstileToken: "",
    },
  })

  const handlePress = async (values: z.infer<typeof formSchema>) => {
    const data = await authClient.signUp.email({
      email: values.email,
      name: values.username,
      password: values.password,
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
          name="username"
          label={t("global.username")}
          placeholder="rdxx"
        />
        <TextField
          control={form.control}
          name="email"
          label={t("global.email")}
          placeholder="galho-preto-pra-caralho@gmail.com"
        />
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
