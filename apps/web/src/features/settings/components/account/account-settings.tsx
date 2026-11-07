// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import type { Session } from "@/lib/session"
import { ConnectedAccountsSection } from "@/features/settings/components/account/connected-accounts-section"
import { EmailSection } from "@/features/settings/components/account/email-section"
import { IdentitySection } from "@/features/settings/components/account/identity-section"
import { settingsStyles } from "@/features/settings/components/settings-styles"

export function AccountSettings({ user }: { user: Session["user"] }) {
  return (
    <div sx={settingsStyles.stack}>
      <IdentitySection user={user} />
      <EmailSection user={user} />
      <ConnectedAccountsSection />
    </div>
  )
}
