// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { Home, Sun } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Link, createFileRoute } from "@tanstack/react-router"
import { authFormStyles as sx } from "@/features/auth/components/auth-form-styles"
import { AuthNotice } from "@/features/auth/components/auth-notice"
import { AuthScreen } from "@/features/auth/components/auth-screen"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/goodbye")({
  head: () => ({ meta: [{ title: m.goodbye_meta_title() }] }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthScreen>
      <AuthNotice
        icon={Sun}
        message={m.goodbye_message()}
        subtitle={m.goodbye_subtitle()}
        title={m.goodbye_title()}
      >
        <Button render={<Link to="/" />} sx={sx.confirmationAction} variant="outline">
          <Home />
          {m.goodbye_home()}
        </Button>
      </AuthNotice>
    </AuthScreen>
  )
}
