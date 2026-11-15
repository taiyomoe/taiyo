// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { useQuery } from "@tanstack/react-query"
import type { Session } from "@/lib/session"
import { myAccountsQueryOptions } from "@/features/settings/api/account"
import { PasswordSection } from "@/features/settings/components/security/password-section"
import { SessionsSection } from "@/features/settings/components/security/sessions-section"
import { TwoFactorSection } from "@/features/settings/components/security/two-factor-section"
import { settingsStyles } from "@/features/settings/components/settings-styles"

export function SecuritySettings({ session }: { session: Session }) {
  const accounts = useQuery(myAccountsQueryOptions)
  const hasPassword =
    accounts.data === undefined
      ? null
      : accounts.data.some((account) => account.providerId === "credential")

  return (
    <div sx={settingsStyles.stack}>
      <PasswordSection hasPassword={hasPassword} />
      <TwoFactorSection
        enabled={session.user.twoFactorEnabled === true}
        hasPassword={hasPassword}
      />
      <SessionsSection currentToken={session.session.token} />
    </div>
  )
}
