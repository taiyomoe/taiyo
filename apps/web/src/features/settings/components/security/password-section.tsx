import { zodResolver } from "@hookform/resolvers/zod"
import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Form } from "@taiyomoe/ui/components/ui/form"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { CheckboxField, PasswordField } from "@/components/fields/form-field"
import { useChangePassword, useSetPassword } from "@/features/settings/api/account"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { settingsStyles } from "@/features/settings/components/settings-styles"
import { AUTH_SETTINGS_MESSAGES } from "@/features/settings/lib/auth-messages"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  skeleton: {
    borderRadius: radius.xl,
    height: "2.5rem",
  },
})
const newPasswordSchema = z
  .string()
  .min(config.auth.password.minLength, m.user_settings_password_short())
  .max(config.auth.password.maxLength, m.user_settings_password_long())
const changeSchema = z
  .object({
    currentPassword: z.string().min(1, m.auth_enter_password()),
    newPassword: newPasswordSchema,
    confirmPassword: z.string(),
    revokeOtherSessions: z.boolean(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: m.user_settings_password_mismatch(),
    path: ["confirmPassword"],
  })
const setSchema = z
  .object({ newPassword: newPasswordSchema, confirmPassword: z.string() })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: m.user_settings_password_mismatch(),
    path: ["confirmPassword"],
  })

export function PasswordSection({ hasPassword }: { hasPassword: boolean | null }) {
  if (hasPassword === null) {
    return (
      <SettingsSection
        description={m.user_settings_password_description()}
        title={m.user_settings_password_title()}
      >
        <Skeleton sx={styles.skeleton} />
      </SettingsSection>
    )
  }

  return hasPassword ? <ChangePasswordForm /> : <SetPasswordForm />
}

function ChangePasswordForm() {
  const change = useChangePassword()
  const form = useForm({
    resolver: zodResolver(changeSchema),
    mode: "onTouched",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      revokeOtherSessions: true,
    },
  })

  return (
    <Form
      noValidate
      onSubmit={(event) => {
        void form.handleSubmit(({ currentPassword, newPassword, revokeOtherSessions }) => {
          change.mutate(
            { currentPassword, newPassword, revokeOtherSessions },
            {
              onSuccess: () => {
                form.reset()
                toastManager.add({ title: m.user_settings_password_changed(), type: "success" })
              },
            },
          )
        })(event)
      }}
    >
      <SettingsSection
        description={m.user_settings_password_description()}
        footer={
          <div sx={settingsStyles.actions}>
            <Button disabled={!form.formState.isDirty} loading={change.isPending} type="submit">
              {m.user_settings_password_change()}
            </Button>
          </div>
        }
        title={m.user_settings_password_title()}
      >
        <div sx={settingsStyles.form}>
          <ErrorAlert
            message={change.isError ? getErrorMessage(change.error, AUTH_SETTINGS_MESSAGES) : null}
          />
          <PasswordField
            autoComplete="current-password"
            control={form.control}
            label={m.user_settings_password_current()}
            name="currentPassword"
          />
          <div sx={settingsStyles.row}>
            <PasswordField
              autoComplete="new-password"
              control={form.control}
              label={m.user_settings_password_new()}
              name="newPassword"
            />
            <PasswordField
              autoComplete="new-password"
              control={form.control}
              label={m.user_settings_password_confirm()}
              name="confirmPassword"
            />
          </div>
          <CheckboxField
            control={form.control}
            label={m.user_settings_password_revoke_others()}
            name="revokeOtherSessions"
          />
        </div>
      </SettingsSection>
    </Form>
  )
}

function SetPasswordForm() {
  const set = useSetPassword()
  const form = useForm({
    resolver: zodResolver(setSchema),
    mode: "onTouched",
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  return (
    <Form
      noValidate
      onSubmit={(event) => {
        void form.handleSubmit((values) => {
          set.mutate(values.newPassword, {
            onSuccess: () => {
              form.reset()
              toastManager.add({ title: m.user_settings_password_set_done(), type: "success" })
            },
          })
        })(event)
      }}
    >
      <SettingsSection
        description={m.user_settings_password_set_description()}
        footer={
          <div sx={settingsStyles.actions}>
            <Button disabled={!form.formState.isDirty} loading={set.isPending} type="submit">
              {m.user_settings_password_set()}
            </Button>
          </div>
        }
        title={m.user_settings_password_title()}
      >
        <div sx={settingsStyles.form}>
          <ErrorAlert
            message={set.isError ? getErrorMessage(set.error, AUTH_SETTINGS_MESSAGES) : null}
          />
          <div sx={settingsStyles.row}>
            <PasswordField
              autoComplete="new-password"
              control={form.control}
              label={m.user_settings_password_new()}
              name="newPassword"
            />
            <PasswordField
              autoComplete="new-password"
              control={form.control}
              label={m.user_settings_password_confirm()}
              name="confirmPassword"
            />
          </div>
        </div>
      </SettingsSection>
    </Form>
  )
}
