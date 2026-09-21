// Required even though nothing here calls `stylex.*`: the compiler only
// processes a file that imports StyleX, and the `sx` props below are compiled,
// not runtime props. Drop this import and every style in this file silently
// stops applying. See packages/ui/STYLEX.md.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { AuthAlert } from "@/components/auth/auth-alert"
import { authFormStyles as sx } from "@/components/auth/auth-form-styles"
import { AuthHeading } from "@/components/auth/auth-heading"
import { AuthSocialButtons } from "@/components/auth/auth-social-buttons"
import { AuthSwitchLink } from "@/components/auth/auth-switch-link"
import { useAuthForm } from "@/components/auth/use-auth-form"
import { SunButton } from "@/components/buttons/sun-button"
import { CheckboxField, InputField, PasswordField } from "@/components/fields/form-field"
import { m } from "@/paraglide/messages"
import { zodResolver } from "@hookform/resolvers/zod"
import { LockPasswordIcon, Mail01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { authClient } from "@taiyomoe/auth/client"
import { Form } from "@taiyomoe/ui/components/ui/form"
import { useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"

const signInSchema = z.object({
  email: z.email(m.global_invalid_email()),
  password: z.string().min(1, m.auth_enter_password()),
  rememberMe: z.boolean(),
})

export const SignInForm = () => {
  const navigate = useNavigate()
  const auth = useAuthForm()
  const form = useForm({
    resolver: zodResolver(signInSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "", rememberMe: true },
    disabled: auth.disabled,
  })
  const isSubmitting = form.formState.isSubmitting
  const isBusy = isSubmitting || auth.disabled
  const onSubmit = form.handleSubmit(async (values) => {
    auth.setError(null)

    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
        callbackURL: "/",
      },
      {
        onError: ({ error }) => {
          auth.setError(error.message || m.auth_error_generic())
        },
        onSuccess: () => navigate({ to: "/" }),
      },
    )
  })

  return (
    <>
      <AuthHeading title={m.auth_sign_in_title()} subtitle={m.auth_sign_in_subtitle()} />
      <div sx={sx.stack}>
        <AuthAlert message={auth.error} />
        <AuthSocialButtons
          label={m.auth_divider_sign_in()}
          pending={auth.socialPending}
          disabled={isBusy}
          onSelect={auth.onSocial}
        />
        <Form data-auth-fields sx={sx.fields} onSubmit={onSubmit} noValidate>
          <InputField
            name="email"
            control={form.control}
            label={m.global_email()}
            type="email"
            startIcon={<HugeiconsIcon icon={Mail01Icon} />}
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
          <div sx={sx.row}>
            <CheckboxField control={form.control} name="rememberMe" label={m.auth_remember_me()} />
            <a href="/forgot-password" sx={[sx.link, sx.linkNoWrap]}>
              {m.auth_forgot_password()}
            </a>
          </div>
          <SunButton block type="submit" sx={sx.submit} loading={isSubmitting} disabled={isBusy}>
            {m.auth_sign_in()}
          </SunButton>
        </Form>
      </div>
      <AuthSwitchLink
        prompt={m.auth_footer_no_account()}
        label={m.auth_create_an_account()}
        to="/auth/sign-up"
      />
    </>
  )
}
