"use client"

import { useTranslations } from "next-intl"
import { Button, type ButtonProps } from "react-aria-components"
import { DiscordLogo } from "~/components/logos/discord-logo"

export const DiscordButton = (props: ButtonProps) => {
  const t = useTranslations("auth")

  return (
    <Button
      className="flex h-9 w-full items-center justify-center gap-3 rounded bg-[#5865f2] pressed:bg-[#5865f2]/70 px-4 py-2 font-medium pressed:text-white/70 text-white transition hover:bg-[#5865f2]/80 hover:text-white/80 pressed:[&_path]:fill-white/70 hover:[&_path]:fill-white/80"
      {...props}
    >
      <DiscordLogo className="size-5" color="white" />
      {t("discord")}
    </Button>
  )
}
