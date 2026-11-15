import { zodResolver } from "@hookform/resolvers/zod"
// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { LockPassword, PasswordValidation, Unlink } from "@taiyomoe/ui/components/icons"
import { Form } from "@taiyomoe/ui/components/ui/form"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { SunButton } from "@/components/buttons/sun-button"
import { SunLink } from "@/components/buttons/sun-link"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { PasswordField } from "@/components/fields/form-field"
import { authFormStyles as sx } from "@/features/auth/components/auth-form-styles"
import { AuthHeading } from "@/features/auth/components/auth-heading"
import { AuthNotice } from "@/features/auth/components/auth-notice"
import { AuthSwitchLink } from "@/features/auth/components/auth-switch-link"
import { useAuthForm } from "@/features/auth/hooks/use-auth-form"
import { m } from "@/paraglide/messages"

const schema = z
  .object({
    newPassword: z
      .string()
      .min(
        config.auth.password.minLength,
        m.global_min_length({ count: config.auth.password.minLength }),
      )
      .max(
        config.auth.password.maxLength,
        m.global_max_length({ count: config.auth.password.maxLength }),
      ),
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: m.user_settings_password_mismatch(),
    path: ["confirmPassword"],
  })

export const ResetPasswordForm = ({ token }: { token: string | undefined }) => {
  const auth = useAuthForm()
  const [done, setDone] = useState(false)
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { newPassword: "", confirmPassword: "" },
  })
  const isSubmitting = form.formState.isSubmitting
  const onSubmit = form.handleSubmit(async ({ newPassword }) => {
    if (token === undefined) {
      return
    }

    const result = await auth.resetPassword({ newPassword, token })

    if (result.ok) {
      setDone(true)
    }
  })

  if (token === undefined) {
    return (
      <AuthNotice
        icon={Unlink}
        title={m.auth_reset_expired_title()}
        subtitle={m.auth_reset_expired_subtitle()}
        message={m.auth_reset_expired()}
      >
        <SunLink block size="md" to="/auth/forgot-password">
          {m.auth_request_new_link()}
        </SunLink>
      </AuthNotice>
    )
  }

  if (done) {
    return (
      <AuthNotice
        icon={PasswordValidation}
        title={m.auth_reset_done_title()}
        subtitle={m.auth_reset_done_subtitle()}
        message={m.auth_reset_done()}
      >
        <SunLink block size="md" to="/auth/sign-in">
          {m.auth_sign_in()}
        </SunLink>
      </AuthNotice>
    )
  }

  return (
    <>
      <AuthHeading
        title={m.auth_reset_password_title()}
        subtitle={m.auth_reset_password_subtitle()}
      />
      <div sx={sx.stack}>
        <ErrorAlert message={auth.error} />
        <Form
          data-auth-fields
          sx={sx.fields}
          onSubmit={(event) => {
            void onSubmit(event)
          }}
          noValidate
        >
          <PasswordField
            name="newPassword"
            control={form.control}
            label={m.user_settings_password_new()}
            startIcon={<LockPassword />}
            size="lg"
            autoComplete="new-password"
            autoFocus
            placeholder="••••••••"
          />
          <PasswordField
            name="confirmPassword"
            control={form.control}
            label={m.user_settings_password_confirm()}
            startIcon={<LockPassword />}
            size="lg"
            autoComplete="new-password"
            placeholder="••••••••"
          />
          <SunButton block type="submit" sx={sx.submit} loading={isSubmitting}>
            {m.auth_reset_password_submit()}
          </SunButton>
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
