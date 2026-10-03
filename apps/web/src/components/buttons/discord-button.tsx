import * as stylex from "@stylexjs/stylex"
import { DiscordLogo } from "@taiyomoe/ui/components/logos/discord-logo"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { ComponentProps } from "react"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  logo: {
    height: "1.25rem",
    width: "1.25rem",
  },
})

export const DiscordButton = (props: ComponentProps<typeof Button>) => (
  <Button type="button" variant="outline" {...props}>
    <DiscordLogo {...stylex.props(styles.logo)} />
    {m.global_discord()}
  </Button>
)
