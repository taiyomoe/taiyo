"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { authClient } from "@taiyomoe/auth/client"
import type { InferNestedPaths } from "@taiyomoe/types"
import { ArrowRightIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { PasswordField } from "~/components/fields/password-field"
import { Form } from "~/components/ui/form"
import { GradientButton } from "~/components/ui/gradient-button"
import { SubmitButton } from "~/components/ui/submit-button"
import {
  type ResetPasswordInput,
  resetPasswordSchema,
} from "~/schemas/users.schemas"
import { authMessages } from "~/utils/auth-messages"

type Props = { token: string }

export const ResetPasswordForm = ({ token }: Props) => {
  const t = useTranslations()
  const router = useRouter()
  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const handleSubmit = async (values: ResetPasswordInput) => {
    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    })

    if (error) {
      if (error.code && error.code in authMessages)
        toast.error(
          t(authMessages[error.code as InferNestedPaths<typeof authMessages>]),
        )
      else toast.error(t("auth.resetPassword.error"))

      return
    }

    toast.success(t("auth.resetPassword.success"))
    router.push("/auth/sign-in")
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2">
        <h1 className="font-bold text-2xl">{t("auth.resetPassword.title")}</h1>
        <p className="text-sm text-subtle">
          {t("auth.resetPassword.description")}
        </p>
      </div>
      <Form {...form} onSubmit={handleSubmit}>
        <PasswordField control={form.control} name="password" showStrength />
        <PasswordField
          control={form.control}
          name="confirmPassword"
          label={t("global.confirmPassword")}
        />
        <SubmitButton asChild>
          <GradientButton className="mt-6 hover:[&_svg]:translate-x-1">
            {t("auth.resetPassword.action")}
            <ArrowRightIcon />
          </GradientButton>
        </SubmitButton>
      </Form>
    </div>
  )
}
