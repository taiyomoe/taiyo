import * as stylex from "@stylexjs/stylex"

import { AuthAlert } from "@/components/auth/auth-alert"
import { authFormStyles as sx } from "@/components/auth/auth-form-styles"
import { AuthHeading } from "@/components/auth/auth-heading"
import { AuthSocialButtons } from "@/components/auth/auth-social-buttons"
import { AuthSwitchLink } from "@/components/auth/auth-switch-link"
import { useAuthForm } from "@/components/auth/use-auth-form"
import { SunButton } from "@/components/buttons/sun-button"
import { CheckboxField, InputField, PasswordField } from "@/components/fields/form-field"
import { env } from "@/env/client"
import { m } from "@/paraglide/messages"
import { zodResolver } from "@hookform/resolvers/zod"
import { LockPasswordIcon, Mail01Icon, UserAccountIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { ParaglideMessage } from "@inlang/paraglide-js-react"
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import { authClient } from "@taiyomoe/auth/client"
import { config } from "@taiyomoe/config"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Form } from "@taiyomoe/ui/components/ui/form"
import { Link } from "@tanstack/react-router"
import { ArrowLeft, MailCheck } from "lucide-react"
import { type FormEvent, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
  const onSubmit = (event: FormEvent<HTMLFormElement>) =>
    form.handleSubmit(async (values) => {
      auth.setError(null)

      await authClient.signUp.email(
        { name: values.name, email: values.email, password: values.password, callbackURL: "/" },
        {
          headers: captchaToken ? { "x-captcha-response": captchaToken } : undefined,
          onError: ({ error }) => {
            auth.setError(error.message || m.auth_error_generic())
            // Turnstile tokens are single-use — reset the widget so the user can retry.
            turnstileRef.current?.reset()
            setCaptchaToken(null)
          },
          onSuccess: () => setPendingEmail(values.email),
        },
      )
    })(event)

  if (pendingEmail) {
    return (
      <>
        <AuthHeading title={m.auth_check_inbox_title()} subtitle={m.auth_check_inbox_subtitle()} />
        <div sx={sx.confirmation}>
          <div sx={sx.confirmationBadge}>
            <MailCheck {...stylex.props(sx.confirmationIcon)} />
          </div>
          <p sx={sx.confirmationText}>{m.auth_verification_sent({ email: pendingEmail })}</p>
          <Button
            type="button"
            variant="outline"
            sx={sx.confirmationAction}
            onClick={() => {
              setPendingEmail(null)
              auth.setError(null)
            }}
          >
            <ArrowLeft />
            {m.auth_back_to_sign_up()}
          </Button>
        </div>
        <AuthSwitchLink
          prompt={m.auth_footer_have_account()}
          label={m.auth_sign_in()}
          to="/auth/sign-in"
        />
      </>
    )
  }

  return (
    <>
      <AuthHeading title={m.auth_sign_up_title()} subtitle={m.auth_sign_up_subtitle()} />
      <div sx={sx.stack}>
        <AuthAlert message={auth.error} />
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
          <CheckboxField
            control={form.control}
            name="agree"
            label={
              <ParaglideMessage
                message={m.auth_agree}
                inputs={{}}
                markup={{
                  terms: ({ children }) => (
                    <Link to="/terms" {...stylex.props(sx.link)}>
                      {children}
                    </Link>
                  ),
                  privacy: ({ children }) => (
                    <Link to="/privacy" {...stylex.props(sx.link)}>
                      {children}
                    </Link>
                  ),
                }}
              />
            }
          />

          <div sx={sx.captchaGroup}>
            <Turnstile
              ref={turnstileRef}
              siteKey={env.VITE_TURNSTILE_SITE_KEY}
              onSuccess={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
              onError={() => setCaptchaToken(null)}
              options={{ theme: "dark", size: "flexible" }}
            />

            <SunButton
              block
              type="submit"
              loading={isSubmitting}
              disabled={isBusy || !captchaToken}
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
