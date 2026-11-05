import { zodResolver } from "@hookform/resolvers/zod"
import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Form } from "@taiyomoe/ui/components/ui/form"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { font } from "@taiyomoe/ui/styles/tokens.stylex"
import { useNavigate } from "@tanstack/react-router"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import type { Session } from "@/lib/session"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { InputField } from "@/components/fields/form-field"
import { useUpdateAccount } from "@/features/settings/api/account"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { settingsStyles } from "@/features/settings/components/settings-styles"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const schema = z.object({
  displayName: z
    .string()
    .trim()
    .regex(config.auth.displayName.regex, m.user_settings_display_name_invalid()),
  username: z.string().trim().regex(config.auth.username.regex, m.user_settings_username_invalid()),
})
const styles = stylex.create({
  url: {
    fontFamily: font.mono,
  },
})

export function IdentitySection({ user }: { user: Session["user"] }) {
  const update = useUpdateAccount()
  const navigate = useNavigate()
  const defaults = { displayName: user.displayUsername ?? user.name, username: user.username ?? "" }
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: defaults,
  })
  const username = useWatch({ control: form.control, name: "username" })

  return (
    <Form
      noValidate
      onSubmit={(event) => {
        void form.handleSubmit((values) => {
          update.mutate(
            {
              ...(values.displayName === defaults.displayName
                ? {}
                : { displayName: values.displayName }),
              ...(values.username === defaults.username ? {} : { username: values.username }),
            },
            {
              onSuccess: (account) => {
                form.reset({ displayName: account.displayUsername, username: account.username })
                toastManager.add({ title: m.user_settings_identity_saved(), type: "success" })
                void navigate({ to: "/settings", search: { tab: "account" }, replace: true })
              },
            },
          )
        })(event)
      }}
    >
      <SettingsSection
        description={m.user_settings_identity_description()}
        footer={
          <div sx={settingsStyles.actions}>
            <Button disabled={!form.formState.isDirty} loading={update.isPending} type="submit">
              {m.save()}
            </Button>
          </div>
        }
        title={m.user_settings_identity_title()}
      >
        <div sx={settingsStyles.form}>
          <ErrorAlert
            message={
              update.isError
                ? getErrorMessage(update.error, {
                    USERNAME_TAKEN: m.user_settings_username_taken,
                    DISPLAY_NAME_TAKEN: m.user_settings_display_name_taken,
                  })
                : null
            }
          />
          <div sx={settingsStyles.row}>
            <InputField
              autoComplete="nickname"
              control={form.control}
              description={m.user_settings_display_name_hint()}
              label={m.user_settings_display_name()}
              maxLength={config.auth.displayName.maxLength}
              name="displayName"
            />
            <InputField
              autoComplete="username"
              control={form.control}
              description={m.user_settings_username_hint({
                url: `/users/${username.toLowerCase()}`,
              })}
              label={m.user_settings_username()}
              maxLength={config.auth.username.maxLength}
              name="username"
              sx={styles.url}
            />
          </div>
        </div>
      </SettingsSection>
    </Form>
  )
}
