"use client"

import { Button } from "@nextui-org/button"
import { signIn } from "@taiyomoe/auth/client"
import { CompanyLogo } from "~/components/ui/CompanyLogo"

export const DiscordButton = () => {
  return (
    <Button
      className="w-full bg-discord font-medium text-discord-foreground text-medium hover:bg-discord/80"
      startContent={<CompanyLogo company="discord" height={28} />}
      onClick={() => signIn("discord")}
      radius="full"
    >
      <p className="w-full">Discord</p>
    </Button>
  )
}
