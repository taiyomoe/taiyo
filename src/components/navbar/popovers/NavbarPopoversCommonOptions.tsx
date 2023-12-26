import { Button } from "@nextui-org/button"
import { FlagIcon, SettingsIcon, SunMoonIcon } from "lucide-react"
import Link from "next/link"

import { CompanyLogo } from "~/components/ui/CompanyLogo"
import ThemeSwitch from "~/components/ui/ThemeSwitch"
import { siteConfig } from "~/lib/config"

export const NavbarPopoversCommonOptions = () => {
  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        className="justify-normal gap-3 p-2 text-medium font-medium"
        startContent={<SettingsIcon />}
        variant="light"
        isDisabled
      >
        Configurações
      </Button>
      <Button
        className="disabled justify-normal gap-3 p-2 text-medium font-medium"
        startContent={<FlagIcon />}
        variant="light"
        isDisabled
      >
        Linguagem
      </Button>
      <div className="flex justify-between">
        <div className="flex gap-3 p-2 opacity-disabled">
          <SunMoonIcon />
          <p className="select-none text-medium font-medium">Tema</p>
        </div>
        <ThemeSwitch />
      </div>
      <div className="flex">
        <Button
          as={Link}
          href={siteConfig.discord.url}
          className="hover:bg-discord/70 mt-4 w-full gap-4 bg-discord text-medium font-medium text-discord-foreground"
          startContent={<CompanyLogo company="discord" height={28} />}
          radius="full"
          target="_blank"
        >
          <p className="w-full">Discord</p>
        </Button>
      </div>
    </div>
  )
}
