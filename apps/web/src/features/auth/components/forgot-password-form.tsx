import { zodResolver } from "@hookform/resolvers/zod"
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { ChevronLeft, Mail, MailValidation } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Form } from "@taiyomoe/ui/components/ui/form"
import { Link } from "@tanstack/react-router"
import { type SubmitEvent, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { SunButton } from "@/components/buttons/sun-button"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { InputField } from "@/components/fields/form-field"
import { env } from "@/env/client"
import { authFormStyles as sx } from "@/features/auth/components/auth-form-styles"
import { AuthHeading } from "@/features/auth/components/auth-heading"
import { AuthNotice } from "@/features/auth/components/auth-notice"
import { AuthSwitchLink } from "@/features/auth/components/auth-switch-link"
import { useAuthForm } from "@/features/auth/hooks/use-auth-form"
import { m } from "@/paraglide/messages"

const schema = z.object({ email: z.email(m.global_invalid_email()) })

export const ForgotPasswordForm = () => {
  const auth = useAuthForm()
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance | null>(null)
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { email: "" },
  })
  const isSubmitting = form.formState.isSubmitting
  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    void form.handleSubmit(async ({ email }) => {
      const result = await auth.requestPasswordReset(email, {
        captchaToken,
        redirectTo: new URL("/auth/reset-password", window.location.origin).href,
      })

      if (result.ok) {
        setSentTo(email)
      } else {
        turnstileRef.current?.reset()
        setCaptchaToken(null)
      }
    })(event)
  }

  if (sentTo !== null) {
    return (
      <AuthNotice
        icon={MailValidation}
        title={m.auth_check_inbox_title()}
        subtitle={m.auth_reset_sent_subtitle()}
        message={m.auth_reset_sent({ email: sentTo })}
      >
        <Button
          variant="outline"
          sx={sx.confirmationAction}
          render={
            <Link from="/auth" search={({ redirect }) => ({ redirect })} to="/auth/sign-in" />
          }
        >
          <ChevronLeft />
          {m.auth_back_to_sign_in()}
        </Button>
      </AuthNotice>
    )
  }

  return (
    <>
      <AuthHeading
        title={m.auth_forgot_password_title()}
        subtitle={m.auth_forgot_password_subtitle()}
      />
      <div sx={sx.stack}>
        <ErrorAlert message={auth.error} />
        <Form data-auth-fields sx={sx.fields} onSubmit={onSubmit} noValidate>
          <InputField
            name="email"
            control={form.control}
            label={m.global_email()}
            type="email"
            startIcon={<Mail />}
            size="lg"
            autoComplete="email"
            autoFocus
            placeholder={m.auth_email_placeholder()}
          />
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
              disabled={isSubmitting || captchaToken === null || captchaToken === ""}
            >
              {m.auth_send_reset_link()}
            </SunButton>
          </div>
        </Form>
      </div>
      <AuthSwitchLink
        prompt={m.auth_footer_remembered()}
        label={m.auth_sign_in()}
        to="/auth/sign-in"
      />
    </>
  )
}
