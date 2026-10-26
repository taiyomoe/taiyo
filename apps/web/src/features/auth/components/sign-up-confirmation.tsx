import { ArrowLeft01Icon, MailValidation01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { authFormStyles as sx } from "@/features/auth/components/auth-form-styles"
import { AuthHeading } from "@/features/auth/components/auth-heading"
import { AuthSwitchLink } from "@/features/auth/components/auth-switch-link"
import { m } from "@/paraglide/messages"

type SignUpConfirmationProps = {
  email: string
  onBack: () => void
}

export const SignUpConfirmation = ({ email, onBack }: SignUpConfirmationProps) => (
  <>
    <AuthHeading title={m.auth_check_inbox_title()} subtitle={m.auth_check_inbox_subtitle()} />
    <div sx={sx.confirmation}>
      <div sx={sx.confirmationBadge}>
        <HugeiconsIcon icon={MailValidation01Icon} {...stylex.props(sx.confirmationIcon)} />
      </div>
      <p sx={sx.confirmationText}>{m.auth_verification_sent({ email })}</p>
      <Button type="button" variant="outline" sx={sx.confirmationAction} onClick={onBack}>
        <HugeiconsIcon icon={ArrowLeft01Icon} />
        {m.auth_back_to_sign_up()}
      </Button>
    </div>
    <AuthSwitchLink
      prompt={m.auth_footer_have_account()}
      label={m.auth_sign_in()}
      to="/auth/sign-in"
    />
  </>
)
