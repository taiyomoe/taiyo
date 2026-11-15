import { zodResolver } from "@hookform/resolvers/zod"
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { Key } from "@taiyomoe/ui/components/icons"
import { Form } from "@taiyomoe/ui/components/ui/form"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { useAuthForm } from "@/features/auth/hooks/use-auth-form"
import { SunButton } from "@/components/buttons/sun-button"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { CheckboxField, InputField } from "@/components/fields/form-field"
import { authFormStyles as sx } from "@/features/auth/components/auth-form-styles"
import { AuthHeading } from "@/features/auth/components/auth-heading"
import { m } from "@/paraglide/messages"

const schema = z.object({
  code: z.string().trim().min(1, m.auth_2fa_enter_code()),
  trustDevice: z.boolean(),
})

export function TwoFactorForm({
  auth,
  onBack,
}: {
  auth: ReturnType<typeof useAuthForm>
  onBack: () => void
}) {
  const [backup, setBackup] = useState(false)
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: { code: "", trustDevice: false },
  })
  const isSubmitting = form.formState.isSubmitting
  const onSubmit = form.handleSubmit(async ({ code, trustDevice }) => {
    const result = await auth.verifyTwoFactor({
      code: backup ? code : code.replace(/\s/g, ""),
      backup,
      trustDevice,
    })

    if (!result.ok) {
      form.setValue("code", "")
      form.setFocus("code")
    }
  })

  return (
    <>
      <AuthHeading
        subtitle={backup ? m.auth_2fa_backup_subtitle() : m.auth_2fa_subtitle()}
        title={m.auth_2fa_title()}
      />
      <div sx={sx.stack}>
        <ErrorAlert message={auth.error} />
        <Form
          data-auth-fields
          noValidate
          onSubmit={(event) => {
            void onSubmit(event)
          }}
          sx={sx.fields}
        >
          <InputField
            autoComplete="one-time-code"
            autoFocus
            control={form.control}
            inputMode={backup ? "text" : "numeric"}
            label={backup ? m.auth_2fa_backup_code() : m.auth_2fa_code()}
            maxLength={backup ? 32 : 6}
            name="code"
            placeholder={backup ? "xxxxx-xxxxx" : "123456"}
            size="lg"
            startIcon={<Key />}
          />
          <div sx={sx.row}>
            <CheckboxField
              control={form.control}
              label={m.auth_2fa_trust_device()}
              name="trustDevice"
            />
            <button
              onClick={() => {
                auth.clearError()
                form.reset({ code: "", trustDevice: form.getValues("trustDevice") })
                setBackup(!backup)
              }}
              sx={[sx.link, sx.linkNoWrap, sx.textButton]}
              type="button"
            >
              {backup ? m.auth_2fa_use_app() : m.auth_2fa_use_backup()}
            </button>
          </div>
          <SunButton block loading={isSubmitting} sx={sx.submit} type="submit">
            {m.auth_2fa_verify()}
          </SunButton>
        </Form>
      </div>
      <p sx={sx.footer}>
        <button onClick={onBack} sx={[sx.link, sx.textButton]} type="button">
          {m.auth_2fa_back()}
        </button>
      </p>
    </>
  )
}
