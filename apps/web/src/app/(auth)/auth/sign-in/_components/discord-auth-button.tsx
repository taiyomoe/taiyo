"use client"

import { Button } from "@heroui/button"
import { authClient } from "@taiyomoe/auth/client"
import { toast } from "sonner"
import { CompanyLogo } from "~/components/ui/CompanyLogo"

export const DiscordAuthButton = () => {
  const handlePress = async () => {
    const data = await authClient.signIn.social({ provider: "discord" })

    if (data.error) {
      toast.error("Ocorreu um erro inesperado ao tentar logar com o Discord")
      console.error(data.error)
    }
  }

  return (
    <Button
      className="w-full bg-discord font-medium text-discord-foreground hover:bg-discord/80"
      startContent={<CompanyLogo company="discord" height={28} />}
      onPress={handlePress}
      radius="full"
      size="lg"
      type="submit"
    >
      Discord
    </Button>
  )
}
