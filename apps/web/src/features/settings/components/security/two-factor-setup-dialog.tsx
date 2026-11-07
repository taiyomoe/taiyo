import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import { Field, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { OTPField, OTPFieldInput } from "@taiyomoe/ui/components/ui/otp-field"
import { PasswordInput } from "@taiyomoe/ui/components/ui/password-input"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { useEnableTwoFactor, useVerifyTotp } from "@/features/settings/api/two-factor"
import { BackupCodes } from "@/features/settings/components/security/backup-codes"
import { QrCode } from "@/features/settings/components/security/qr-code"
import { settingsStyles } from "@/features/settings/components/settings-styles"
import { AUTH_SETTINGS_MESSAGES } from "@/features/settings/lib/auth-messages"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const CODE_LENGTH = 6
const styles = stylex.create({
  contents: {
    display: "contents",
  },
  scan: {
    gap: "1.25rem",
    alignItems: { default: "center", [breakpoints.sm]: "flex-start" },
    display: "flex",
    flexDirection: { default: "column", [breakpoints.sm]: "row" },
  },
  scanText: {
    gap: "0.625rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  secret: {
    borderRadius: radius.lg,
    paddingBlock: "0.5rem",
    paddingInline: "0.75rem",
    backgroundColor: colors.muted,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    letterSpacing: "0.06em",
    overflowWrap: "anywhere",
    userSelect: "all",
  },
})
const STEP_DESCRIPTIONS = {
  start: m.user_settings_2fa_setup_start,
  scan: m.user_settings_2fa_setup_scan,
  codes: m.user_settings_2fa_codes_description,
}
const STEP_ACTIONS = {
  start: m.user_settings_2fa_continue,
  scan: m.user_settings_2fa_verify,
  codes: m.user_settings_2fa_done,
}
const readSecret = (uri: string) => {
  try {
    return new URL(uri).searchParams.get("secret") ?? ""
  } catch {
    return ""
  }
}

export function TwoFactorSetupDialog({
  hasPassword,
  onClose,
}: {
  hasPassword: boolean
  onClose: () => void
}) {
  const enable = useEnableTwoFactor()
  const verify = useVerifyTotp()
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"start" | "scan" | "codes">("start")
  const setup = enable.data?.method === "totp" ? enable.data : null
  const error = enable.error ?? verify.error
  const submitCode = (value: string) => {
    verify.mutate(value, {
      onSuccess: () => {
        setStep("codes")
        toastManager.add({ title: m.user_settings_2fa_enabled_toast(), type: "success" })
      },
      onError: () => {
        setCode("")
      },
    })
  }

  return (
    <Dialog
      defaultOpen
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogPopup>
        <form
          sx={styles.contents}
          onSubmit={(event) => {
            event.preventDefault()

            if (step === "start") {
              enable.mutate(hasPassword ? password : undefined, {
                onSuccess: () => {
                  setStep("scan")
                },
              })
            } else if (step === "scan") {
              submitCode(code)
            } else {
              onClose()
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {step === "codes"
                ? m.user_settings_2fa_codes_title()
                : m.user_settings_2fa_setup_title()}
            </DialogTitle>
            <DialogDescription>{STEP_DESCRIPTIONS[step]()}</DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <div sx={settingsStyles.form}>
              <ErrorAlert
                message={error === null ? null : getErrorMessage(error, AUTH_SETTINGS_MESSAGES)}
              />
              {step === "start" && hasPassword ? (
                <Field>
                  <FieldLabel>{m.global_password()}</FieldLabel>
                  <PasswordInput
                    autoComplete="current-password"
                    autoFocus
                    onChange={(event) => {
                      setPassword(event.target.value)
                    }}
                    value={password}
                  />
                </Field>
              ) : null}
              {step === "scan" && setup !== null ? (
                <>
                  <div sx={styles.scan}>
                    <QrCode label={m.user_settings_2fa_qr()} value={setup.totpURI} />
                    <div sx={styles.scanText}>
                      <span sx={settingsStyles.muted}>{m.user_settings_2fa_manual()}</span>
                      <code sx={styles.secret}>{readSecret(setup.totpURI)}</code>
                    </div>
                  </div>
                  <Field>
                    <FieldLabel>{m.user_settings_2fa_code()}</FieldLabel>
                    <OTPField
                      disabled={verify.isPending}
                      length={CODE_LENGTH}
                      onValueChange={setCode}
                      onValueComplete={submitCode}
                      size="lg"
                      value={code}
                    >
                      {Array.from({ length: CODE_LENGTH }, (_, index) => (
                        <OTPFieldInput autoFocus={index === 0} key={index} />
                      ))}
                    </OTPField>
                  </Field>
                </>
              ) : null}
              {step === "codes" && setup !== null ? (
                <BackupCodes codes={setup.backupCodes} />
              ) : null}
            </div>
          </DialogPanel>
          <DialogFooter>
            {step === "codes" ? null : (
              <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
            )}
            <Button
              disabled={
                (step === "start" && hasPassword && password === "") ||
                (step === "scan" && code.length < CODE_LENGTH)
              }
              loading={enable.isPending || verify.isPending}
              type="submit"
            >
              {STEP_ACTIONS[step]()}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  )
}
