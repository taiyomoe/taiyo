import { zodResolver } from "@hookform/resolvers/zod"
import { LockPasswordIcon, Mail01Icon, UserAccountIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { Form } from "@taiyomoe/ui/components/ui/form"
import { type SubmitEvent, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { SunButton } from "@/components/buttons/sun-button"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { CheckboxField, InputField, PasswordField } from "@/components/fields/form-field"
import { env } from "@/env/client"
import { authFormStyles as sx } from "@/features/auth/components/auth-form-styles"
import { AuthHeading } from "@/features/auth/components/auth-heading"
import { AuthSocialButtons } from "@/features/auth/components/auth-social-buttons"
import { AuthSwitchLink } from "@/features/auth/components/auth-switch-link"
import { SignUpAgreeLabel } from "@/features/auth/components/sign-up-agree-label"
import { SignUpConfirmation } from "@/features/auth/components/sign-up-confirmation"
import { useAuthForm } from "@/features/auth/hooks/use-auth-form"
import { m } from "@/paraglide/messages"

const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      config.auth.displayName.minLength,
      m.global_min_length({ count: config.auth.displayName.minLength }),
    )
    .max(
      config.auth.displayName.maxLength,
      m.global_max_length({ count: config.auth.displayName.maxLength }),
    )
    .regex(config.auth.displayName.regex, m.auth_display_name_pattern()),
  email: z.email(m.global_invalid_email()),
  password: z
    .string()
    .min(
      config.auth.password.minLength,
      m.global_min_length({ count: config.auth.password.minLength }),
    )
    .max(
      config.auth.password.maxLength,
      m.global_max_length({ count: config.auth.password.maxLength }),
    ),
  agree: z.boolean().refine((value) => value, m.auth_accept_terms()),
})

export const SignUpForm = () => {
  const auth = useAuthForm()
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance | null>(null)
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "", agree: false },
    disabled: auth.disabled,
  })
  const isSubmitting = form.formState.isSubmitting
  const isBusy = isSubmitting || auth.disabled
  // handleSubmit() is invoked at event time rather than during render: its
  // callback reads turnstileRef.current, and the React Compiler must assume a
  // function passed to a call made during render may itself run during render.
  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    void form.handleSubmit(async (values) => {
      const result = await auth.signUp(
        { name: values.name, email: values.email, password: values.password },
        { captchaToken },
      )

      if (result.ok) {
        setPendingEmail(values.email)
      } else {
        turnstileRef.current?.reset()
        setCaptchaToken(null)
      }
    })(event)
  }

  if (pendingEmail !== null && pendingEmail !== "") {
    return (
      <SignUpConfirmation
        email={pendingEmail}
        onBack={() => {
          setPendingEmail(null)
          auth.clearError()
        }}
      />
    )
  }

  return (
    <>
      <AuthHeading title={m.auth_sign_up_title()} subtitle={m.auth_sign_up_subtitle()} />
      <div sx={sx.stack}>
        <ErrorAlert message={auth.error} />
        <AuthSocialButtons
          label={m.auth_divider_sign_up()}
          pending={auth.socialPending}
          disabled={isBusy}
          onSelect={auth.onSocial}
        />
        <Form data-auth-fields sx={sx.fields} onSubmit={onSubmit} noValidate>
          <InputField
            name="name"
            control={form.control}
            label={m.auth_display_name()}
            startIcon={<HugeiconsIcon icon={UserAccountIcon} />}
            size="lg"
            placeholder={m.auth_display_name_placeholder()}
            autoComplete="name"
          />
          <InputField
            name="email"
            control={form.control}
            label={m.global_email()}
            type="email"
            startIcon={<HugeiconsIcon icon={Mail01Icon} />}
            size="lg"
            placeholder={m.auth_email_placeholder()}
            autoComplete="email"
          />
          <PasswordField
            name="password"
            control={form.control}
            size="lg"
            startIcon={<HugeiconsIcon icon={LockPasswordIcon} />}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <CheckboxField control={form.control} name="agree" label={<SignUpAgreeLabel />} />

          <div sx={sx.captchaGroup}>
            <Turnstile
              ref={turnstileRef}
              siteKey={env.VITE_TURNSTILE_SITE_KEY}
              onSuccess={(token) => {
                setCaptchaToken(token)
              }}
              onExpire={() => {
                setCaptchaToken(null)
              }}
              onError={() => {
                setCaptchaToken(null)
              }}
              options={{ theme: "dark", size: "flexible" }}
            />

            <SunButton
              block
              type="submit"
              loading={isSubmitting}
              disabled={isBusy || captchaToken === null || captchaToken === ""}
            >
              {m.auth_create_account()}
            </SunButton>
          </div>
        </Form>
      </div>
      <AuthSwitchLink
        prompt={m.auth_footer_have_account()}
        label={m.auth_sign_in()}
        to="/auth/sign-in"
      />
    </>
  )
}
