import * as stylex from "@stylexjs/stylex"
import { GoogleLogo } from "@taiyomoe/ui/components/logos/google-logo"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { ComponentProps } from "react"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  logo: {
    height: "1.25rem",
    width: "1.25rem",
  },
})

export const GoogleButton = (props: ComponentProps<typeof Button>) => (
  <Button type="button" variant="outline" {...props}>
    <GoogleLogo {...stylex.props(styles.logo)} />
    {m.global_google()}
  </Button>
)
