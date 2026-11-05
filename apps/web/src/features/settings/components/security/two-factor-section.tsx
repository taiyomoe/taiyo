// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { Shield } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useState } from "react"
import { useDisableTwoFactor, useGenerateBackupCodes } from "@/features/settings/api/two-factor"
import { BackupCodes } from "@/features/settings/components/security/backup-codes"
import { PasswordConfirmDialog } from "@/features/settings/components/security/password-confirm-dialog"
import { TwoFactorSetupDialog } from "@/features/settings/components/security/two-factor-setup-dialog"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { settingsStyles } from "@/features/settings/components/settings-styles"
import { AUTH_SETTINGS_MESSAGES } from "@/features/settings/lib/auth-messages"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export function TwoFactorSection({
  enabled,
  hasPassword,
}: {
  enabled: boolean
  hasPassword: boolean | null
}) {
  const [dialog, setDialog] = useState<"setup" | "disable" | "codes" | null>(null)
  const disable = useDisableTwoFactor()
  const regenerate = useGenerateBackupCodes()
  const close = () => {
    setDialog(null)
    disable.reset()
    regenerate.reset()
  }

  return (
    <SettingsSection
      action={
        enabled ? (
          <Badge variant="success">{m.user_settings_2fa_on()}</Badge>
        ) : (
          <Badge variant="secondary">{m.user_settings_2fa_off()}</Badge>
        )
      }
      description={m.user_settings_2fa_description()}
      footer={
        <div sx={settingsStyles.actions}>
          {enabled ? (
            <>
              <Button
                disabled={hasPassword === null}
                onClick={() => {
                  setDialog("codes")
                }}
                variant="outline"
              >
                {m.user_settings_2fa_new_codes()}
              </Button>
              <Button
                disabled={hasPassword === null}
                onClick={() => {
                  setDialog("disable")
                }}
                variant="destructive-outline"
              >
                {m.user_settings_2fa_disable()}
              </Button>
            </>
          ) : (
            <Button
              disabled={hasPassword === null}
              onClick={() => {
                setDialog("setup")
              }}
            >
              <Shield />
              {m.user_settings_2fa_enable()}
            </Button>
          )}
        </div>
      }
      title={m.user_settings_2fa_title()}
    >
      <p sx={settingsStyles.muted}>
        {hasPassword === false ? m.user_settings_2fa_no_password() : m.user_settings_2fa_how()}
      </p>
      {dialog === "setup" && hasPassword !== null ? (
        <TwoFactorSetupDialog hasPassword={hasPassword} onClose={close} />
      ) : null}
      {dialog === "disable" && hasPassword !== null ? (
        <PasswordConfirmDialog
          confirmLabel={m.user_settings_2fa_disable()}
          description={m.user_settings_2fa_disable_description()}
          destructive
          error={disable.isError ? getErrorMessage(disable.error, AUTH_SETTINGS_MESSAGES) : null}
          hasPassword={hasPassword}
          onClose={close}
          onConfirm={(password) => {
            disable.mutate(password, {
              onSuccess: () => {
                close()
                toastManager.add({ title: m.user_settings_2fa_disabled_toast(), type: "success" })
              },
            })
          }}
          pending={disable.isPending}
          title={m.user_settings_2fa_disable_title()}
        />
      ) : null}
      {dialog === "codes" && hasPassword !== null ? (
        <PasswordConfirmDialog
          confirmLabel={
            regenerate.data === undefined
              ? m.user_settings_2fa_new_codes()
              : m.user_settings_2fa_done()
          }
          description={
            regenerate.data === undefined
              ? m.user_settings_2fa_new_codes_description()
              : m.user_settings_2fa_codes_description()
          }
          error={
            regenerate.isError ? getErrorMessage(regenerate.error, AUTH_SETTINGS_MESSAGES) : null
          }
          hasPassword={hasPassword && regenerate.data === undefined}
          onClose={close}
          onConfirm={(password) => {
            if (regenerate.data === undefined) {
              regenerate.mutate(password)
            } else {
              close()
            }
          }}
          pending={regenerate.isPending}
          title={m.user_settings_2fa_codes_title()}
        >
          {regenerate.data === undefined ? null : (
            <BackupCodes codes={regenerate.data.backupCodes} />
          )}
        </PasswordConfirmDialog>
      ) : null}
    </SettingsSection>
  )
}
