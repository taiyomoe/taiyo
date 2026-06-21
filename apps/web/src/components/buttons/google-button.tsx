import { GoogleLogo } from "@taiyomoe/ui/components/logos/google-logo"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { ComponentProps } from "react"
import { m } from "@/paraglide/messages"

export const GoogleButton = (props: ComponentProps<typeof Button>) => (
  <Button type="button" variant="outline" {...props}>
    <GoogleLogo className="size-5" />
    {m.global_google()}
  </Button>
)
