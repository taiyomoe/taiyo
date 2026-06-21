import { DiscordLogo } from "@taiyomoe/ui/components/logos/discord-logo"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { ComponentProps } from "react"
import { m } from "@/paraglide/messages"

export const DiscordButton = (props: ComponentProps<typeof Button>) => (
  <Button type="button" variant="outline" {...props}>
    <DiscordLogo className="size-5" />
    {m.global_discord()}
  </Button>
)
