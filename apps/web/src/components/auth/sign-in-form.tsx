import { AuthHeading } from "@/components/auth/auth-heading"
import { AuthSocialButtons, type SocialProvider } from "@/components/auth/auth-social-buttons"
import { SunButton } from "@/components/auth/sun-button"
import { CheckboxField } from "@/components/fields/checkbox-field"
import { EmailField } from "@/components/fields/email-field"
import { PasswordField } from "@/components/fields/password-field"
import { m } from "@/paraglide/messages"
import { zodResolver } from "@hookform/resolvers/zod"
import { LockPasswordIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { authClient } from "@taiyomoe/auth/client"
import { Alert, AlertTitle } from "@taiyomoe/ui/components/ui/alert"
import { Form } from "@taiyomoe/ui/components/ui/form"
import { useNavigate } from "@tanstack/react-router"
import { CircleAlert } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const signInSchema = z.object({
  email: z.email(m.global_invalid_email()),
  password: z.string().min(1, m.auth_enter_password()),
  rememberMe: z.boolean(),
})

export const SignInForm = () => {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const [socialPending, setSocialPending] = useState<SocialProvider | null>(null)
  const form = useForm({
    resolver: zodResolver(signInSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "", rememberMe: true },
    disabled: socialPending !== null,
  })
  const isSubmitting = form.formState.isSubmitting
  const isBusy = isSubmitting || socialPending !== null
  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)

    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
        callbackURL: "/",
      },
      {
        onError: ({ error }) => {
          setFormError(error.message || m.auth_error_generic())
        },
        onSuccess: () => navigate({ to: "/" }),
      },
    )
  })
  const onSocial = async (provider: SocialProvider) => {
    setFormError(null)
    setSocialPending(provider)

    await authClient.signIn.social(
      { provider, callbackURL: "/" },
      {
        onError: ({ error }) => {
          setFormError(error.message || m.auth_error_generic())
          setSocialPending(null)
        },
      },
    )
  }

  return (
    <>
      <AuthHeading title={m.auth_sign_in_title()} subtitle={m.auth_sign_in_subtitle()} />
      <div className="flex flex-col gap-5">
        {formError ? (
          <Alert variant="error">
            <CircleAlert />
            <AlertTitle>{formError}</AlertTitle>
          </Alert>
        ) : null}
        <AuthSocialButtons
          label={m.auth_divider_sign_in()}
          pending={socialPending}
          disabled={isBusy}
          onSelect={onSocial}
        />
        <Form
          className="flex flex-col gap-4 **:data-[slot=input]:h-12 **:data-[slot=input]:p-0 **:data-[slot=input]:leading-12 **:data-[slot=input-group-addon]:px-4 **:data-[slot=input-group-addon]:[&_svg]:size-5! **:data-[slot=input-group-addon]:[&_svg]:text-muted-foreground/72"
          onSubmit={onSubmit}
          noValidate
        >
          <EmailField
            name="email"
            control={form.control}
            size="lg"
            autoComplete="email"
            placeholder={m.auth_email_placeholder()}
          />
          <PasswordField
            startIcon={<HugeiconsIcon icon={LockPasswordIcon} />}
            control={form.control}
            name="password"
            size="lg"
            autoComplete="current-password"
            placeholder="••••••••"
          />
          <div className="flex items-center justify-between gap-3">
            <CheckboxField control={form.control} name="rememberMe" label={m.auth_remember_me()} />
            <a
              href="/forgot-password"
              className="text-sm font-bold whitespace-nowrap text-[#FFC94D] hover:underline"
            >
              {m.auth_forgot_password()}
            </a>
          </div>
          <SunButton type="submit" className="mt-2" loading={isSubmitting} disabled={isBusy}>
            {m.auth_sign_in()}
          </SunButton>
        </Form>
      </div>
      <p className="mt-6 text-center text-sm text-white/55">
        {m.auth_footer_no_account()}{" "}
        <button
          className="font-bold text-[#FFC94D] hover:underline"
          onClick={() => navigate({ to: "/auth/sign-up" })}
        >
          {m.auth_create_an_account()}
        </button>
      </p>
    </>
  )
}
