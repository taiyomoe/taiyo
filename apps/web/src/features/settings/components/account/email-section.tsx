import { zodResolver } from "@hookform/resolvers/zod"
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { Mail } from "@taiyomoe/ui/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@taiyomoe/ui/components/ui/alert"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Form } from "@taiyomoe/ui/components/ui/form"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Session } from "@/lib/session"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { InputField } from "@/components/fields/form-field"
import { useChangeEmail } from "@/features/settings/api/account"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { settingsStyles } from "@/features/settings/components/settings-styles"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const schema = z.object({ email: z.email(m.global_invalid_email()) })

export function EmailSection({ user }: { user: Session["user"] }) {
  const change = useChangeEmail()
  const [sentTo, setSentTo] = useState<string | null>(null)
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { email: "" },
  })

  return (
    <Form
      noValidate
      onSubmit={(event) => {
        void form.handleSubmit(({ email }) => {
          change.mutate(email, {
            onSuccess: () => {
              setSentTo(email)
              form.reset()
            },
          })
        })(event)
      }}
    >
      <SettingsSection
        description={m.user_settings_email_description()}
        footer={
          <div sx={settingsStyles.actions}>
            <Button disabled={!form.formState.isDirty} loading={change.isPending} type="submit">
              {m.user_settings_email_change()}
            </Button>
          </div>
        }
        title={m.user_settings_email_title()}
      >
        <div sx={settingsStyles.form}>
          <div sx={settingsStyles.item}>
            <Mail size={20} sx={settingsStyles.itemIcon} />
            <div sx={settingsStyles.itemMain}>
              <span sx={settingsStyles.itemTitle}>
                {user.email}
                {user.emailVerified ? (
                  <Badge variant="success">{m.user_settings_email_verified()}</Badge>
                ) : (
                  <Badge variant="warning">{m.user_settings_email_unverified()}</Badge>
                )}
              </span>
              <span sx={settingsStyles.itemMeta}>{m.user_settings_email_current()}</span>
            </div>
          </div>
          {sentTo === null ? null : (
            <Alert variant="info">
              <Mail />
              <AlertTitle>{m.user_settings_email_sent_title()}</AlertTitle>
              <AlertDescription>
                {user.emailVerified
                  ? m.user_settings_email_sent_confirm({ email: user.email })
                  : m.user_settings_email_sent_verify({ email: sentTo })}
              </AlertDescription>
            </Alert>
          )}
          <ErrorAlert message={change.isError ? getErrorMessage(change.error) : null} />
          <InputField
            autoComplete="email"
            control={form.control}
            label={m.user_settings_email_new()}
            name="email"
            placeholder={m.auth_email_placeholder()}
            type="email"
          />
        </div>
      </SettingsSection>
    </Form>
  )
}
