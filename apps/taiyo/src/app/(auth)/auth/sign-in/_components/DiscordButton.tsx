"use client"

import { Button } from "@nextui-org/button"
import { signIn } from "next-auth/react"
import { CompanyLogo } from "~/components/ui/CompanyLogo"

export const DiscordButton = () => {
  return (
    <Button
      className="hover:bg-discord/80 w-full bg-discord text-medium font-medium text-discord-foreground"
      startContent={<CompanyLogo company="discord" height={28} />}
      onClick={() => signIn("discord")}
      radius="full"
    >
      <p className="w-full">Discord</p>
    </Button>
  )
}
