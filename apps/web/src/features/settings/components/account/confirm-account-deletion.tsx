import * as stylex from "@stylexjs/stylex"
import { ChevronLeft, UserRemove } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Link } from "@tanstack/react-router"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { authFormStyles as sx } from "@/features/auth/components/auth-form-styles"
import { AuthNotice } from "@/features/auth/components/auth-notice"
import { useConfirmAccountDeletion } from "@/features/settings/api/account"
import { ApiError } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  actions: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
})

/** The page the emailed link opens: nothing is deleted until the user confirms here. */
export function ConfirmAccountDeletion({
  token,
  username,
}: {
  token: string | undefined
  username: string
}) {
  const confirm = useConfirmAccountDeletion()
  const linkIsDead =
    token === undefined ||
    (confirm.error instanceof ApiError && confirm.error.code === "INVALID_TOKEN")

  return (
    <AuthNotice
      icon={UserRemove}
      message={
        linkIsDead ? m.account_delete_link_dead() : m.account_delete_confirm_message({ username })
      }
      subtitle={linkIsDead ? m.account_delete_dead_subtitle() : m.account_delete_confirm_subtitle()}
      title={linkIsDead ? m.account_delete_dead_title() : m.account_delete_confirm_title()}
    >
      <div sx={styles.actions}>
        {linkIsDead || !confirm.isError ? null : (
          <ErrorAlert message={getErrorMessage(confirm.error)} />
        )}
        {linkIsDead ? null : (
          <Button
            loading={confirm.isPending || confirm.isSuccess}
            onClick={() => {
              confirm.mutate(token, {
                onSuccess: () => {
                  window.location.assign("/goodbye")
                },
              })
            }}
            sx={sx.confirmationAction}
            variant="destructive"
          >
            {m.account_delete_confirm_button()}
          </Button>
        )}
        <Button
          render={<Link search={{ tab: "account" }} to="/settings" />}
          sx={sx.confirmationAction}
          variant="outline"
        >
          <ChevronLeft />
          {linkIsDead ? m.account_delete_back_to_settings() : m.account_delete_keep()}
        </Button>
      </div>
    </AuthNotice>
  )
}
