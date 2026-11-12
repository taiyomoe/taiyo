// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { ChevronLeft, MailValidation } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { authFormStyles as sx } from "@/features/auth/components/auth-form-styles"
import { AuthNotice } from "@/features/auth/components/auth-notice"
import { AuthSwitchLink } from "@/features/auth/components/auth-switch-link"
import { m } from "@/paraglide/messages"

export const SignUpConfirmation = ({ email, onBack }: { email: string; onBack: () => void }) => (
  <>
    <AuthNotice
      icon={MailValidation}
      title={m.auth_check_inbox_title()}
      subtitle={m.auth_check_inbox_subtitle()}
      message={m.auth_verification_sent({ email })}
    >
      <Button type="button" variant="outline" sx={sx.confirmationAction} onClick={onBack}>
        <ChevronLeft />
        {m.auth_back_to_sign_up()}
      </Button>
    </AuthNotice>
    <AuthSwitchLink
      prompt={m.auth_footer_have_account()}
      label={m.auth_sign_in()}
      to="/auth/sign-in"
    />
  </>
)
