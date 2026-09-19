import * as stylex from "@stylexjs/stylex"

import { authFormStyles as sx } from "@/components/auth/auth-form-styles"
import { AuthHeading } from "@/components/auth/auth-heading"
import { AuthSocialButtons, type SocialProvider } from "@/components/auth/auth-social-buttons"
import { SunButton } from "@/components/buttons/sun-button"
import { CheckboxField } from "@/components/fields/checkbox-field"
import { EmailField } from "@/components/fields/email-field"
import { InputField } from "@/components/fields/input-field"
import { PasswordField } from "@/components/fields/password-field"
import { env } from "@/env/client"
import { m } from "@/paraglide/messages"
import { zodResolver } from "@hookform/resolvers/zod"
import { LockPasswordIcon, UserAccountIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { ParaglideMessage } from "@inlang/paraglide-js-react"
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import { authClient } from "@taiyomoe/auth/client"
import { config } from "@taiyomoe/config"
import { Alert, AlertTitle } from "@taiyomoe/ui/components/ui/alert"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Form } from "@taiyomoe/ui/components/ui/form"
import { Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, CircleAlert, MailCheck } from "lucide-react"
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
  const [formError, setFormError] = useState<string | null>(null)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [socialPending, setSocialPending] = useState<SocialProvider | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance | null>(null)
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "", agree: false },
    disabled: socialPending !== null,
  })
  const isSubmitting = form.formState.isSubmitting
  const isBusy = isSubmitting || socialPending !== null
  const navigate = useNavigate()
  // handleSubmit() is invoked at event time rather than during render: its
  // callback reads turnstileRef.current, and the React Compiler must assume a
  // function passed to a call made during render may itself run during render.
  const onSubmit = (event: FormEvent<HTMLFormElement>) =>
    form.handleSubmit(async (values) => {
      setFormError(null)

      await authClient.signUp.email(
        { name: values.name, email: values.email, password: values.password, callbackURL: "/" },
        {
          headers: captchaToken ? { "x-captcha-response": captchaToken } : undefined,
          onError: ({ error }) => {
            setFormError(error.message || m.auth_error_generic())
            // Turnstile tokens are single-use — reset the widget so the user can retry.
            turnstileRef.current?.reset()
            setCaptchaToken(null)
          },
          onSuccess: () => setPendingEmail(values.email),
        },
      )
    })(event)
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
              setFormError(null)
            }}
          >
            <ArrowLeft />
            {m.auth_back_to_sign_up()}
          </Button>
        </div>
        <p sx={sx.footer}>
          {m.auth_footer_have_account()}{" "}
          <button onClick={() => navigate({ to: "/auth/sign-in" })} sx={[sx.link, sx.linkButton]}>
            {m.auth_sign_in()}
          </button>
        </p>
      </>
    )
  }

  return (
    <>
      <AuthHeading title={m.auth_sign_up_title()} subtitle={m.auth_sign_up_subtitle()} />
      <div sx={sx.stack}>
        {formError ? (
          <Alert variant="error">
            <CircleAlert />
            <AlertTitle>{formError}</AlertTitle>
          </Alert>
        ) : null}
        <AuthSocialButtons
          label={m.auth_divider_sign_up()}
          pending={socialPending}
          disabled={isBusy}
          onSelect={onSocial}
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
          <EmailField
            name="email"
            control={form.control}
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

          {/* Turnstile + submit kept as one tight group so the button doesn't read
              as detached from the form when the captcha widget sits above it. */}
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
      <p sx={sx.footer}>
        {m.auth_footer_have_account()}{" "}
        <button onClick={() => navigate({ to: "/auth/sign-in" })} sx={[sx.link, sx.linkButton]}>
          {m.auth_sign_in()}
        </button>
      </p>
    </>
  )
}
