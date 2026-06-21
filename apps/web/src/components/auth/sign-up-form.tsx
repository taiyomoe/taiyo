import { AuthHeading } from "@/components/auth/auth-heading"
import { AuthSocialButtons, type SocialProvider } from "@/components/auth/auth-social-buttons"
import { SunButton } from "@/components/auth/sun-button"
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
import { useRef, useState } from "react"
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
  const onSubmit = form.handleSubmit(async (values) => {
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

  if (pendingEmail) {
    return (
      <>
        <AuthHeading title={m.auth_check_inbox_title()} subtitle={m.auth_check_inbox_subtitle()} />
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-[#FFB820]/10 text-[#FFB820]">
            <MailCheck className="size-6" />
          </div>
          <p className="text-sm text-white/60">
            {m.auth_verification_sent({ email: pendingEmail })}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full sm:h-12"
            onClick={() => {
              setPendingEmail(null)
              setFormError(null)
            }}
          >
            <ArrowLeft />
            {m.auth_back_to_sign_up()}
          </Button>
        </div>
        <p className="mt-6 text-center text-sm text-white/55">
          {m.auth_footer_have_account()}{" "}
          <button
            className="font-bold text-[#FFC94D] hover:underline"
            onClick={() => navigate({ to: "/auth/sign-in" })}
          >
            {m.auth_sign_in()}
          </button>
        </p>
      </>
    )
  }

  return (
    <>
      <AuthHeading title={m.auth_sign_up_title()} subtitle={m.auth_sign_up_subtitle()} />
      <div className="flex flex-col gap-5">
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
        <Form
          className="flex flex-col gap-4 **:data-[slot=input]:h-12 **:data-[slot=input]:p-0 **:data-[slot=input]:leading-12 **:data-[slot=input-group-addon]:px-4 **:data-[slot=input-group-addon]:[&_svg]:size-5! **:data-[slot=input-group-addon]:[&_svg]:text-muted-foreground/72"
          onSubmit={onSubmit}
          noValidate
        >
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
                    <Link to="/terms" className="font-bold text-[#FFC94D] hover:underline">
                      {children}
                    </Link>
                  ),
                  privacy: ({ children }) => (
                    <Link to="/privacy" className="font-bold text-[#FFC94D] hover:underline">
                      {children}
                    </Link>
                  ),
                }}
              />
            }
          />

          {/* Turnstile + submit kept as one tight group so the button doesn't read
              as detached from the form when the captcha widget sits above it. */}
          <div className="mt-2 flex flex-col gap-3">
            <Turnstile
              ref={turnstileRef}
              siteKey={env.VITE_TURNSTILE_SITE_KEY}
              onSuccess={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
              onError={() => setCaptchaToken(null)}
              options={{ theme: "dark", size: "flexible" }}
            />

            <SunButton type="submit" loading={isSubmitting} disabled={isBusy || !captchaToken}>
              {m.auth_create_account()}
            </SunButton>
          </div>
        </Form>
      </div>
      <p className="mt-6 text-center text-sm text-white/55">
        {m.auth_footer_have_account()}{" "}
        <button
          className="font-bold text-[#FFC94D] hover:underline"
          onClick={() => navigate({ to: "/auth/sign-in" })}
        >
          {m.auth_sign_in()}
        </button>
      </p>
    </>
  )
}
