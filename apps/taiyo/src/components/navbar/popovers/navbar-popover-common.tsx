import { Button } from "@nextui-org/button"
import { FlagIcon, SettingsIcon, SunMoonIcon } from "lucide-react"
import Link from "next/link"
import { CompanyLogo } from "~/components/ui/CompanyLogo"
import ThemeSwitch from "~/components/ui/ThemeSwitch"
import { siteConfig } from "~/lib/config"

export const NavbarPopoverCommon = () => (
  <div className="flex w-full flex-col gap-2">
    <Button
      className="justify-normal gap-3 p-2 font-medium text-medium line-through"
      startContent={<SettingsIcon />}
      variant="light"
      isDisabled
    >
      Configurações
    </Button>
    <Button
      className="disabled justify-normal gap-3 p-2 font-medium text-medium line-through"
      startContent={<FlagIcon />}
      variant="light"
      isDisabled
    >
      Linguagem
    </Button>
    <div className="flex justify-between">
      <div className="flex gap-3 p-2 opacity-disabled">
        <SunMoonIcon />
        <p className="select-none font-medium text-medium line-through">Tema</p>
      </div>
      <ThemeSwitch />
    </div>
    <div className="flex">
      <Button
        as={Link}
        href={siteConfig.discord.url}
        className="mt-4 w-full gap-4 bg-discord font-medium text-discord-foreground text-medium hover:bg-discord/70"
        startContent={<CompanyLogo company="discord" height={28} />}
        radius="full"
        target="_blank"
      >
        <p className="w-full">Discord</p>
      </Button>
    </div>
  </div>
)
