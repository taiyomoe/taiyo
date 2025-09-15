"use client"

import type { ComponentProps } from "react"
import { tv } from "tailwind-variants"
import { DiscordLogo } from "~/components/logos/discord-logo"

export const discordButtonVariants = tv({
  base: "flex h-9 w-full items-center justify-center gap-3 rounded bg-[#5865f2] pressed:bg-[#5865f2]/70 px-4 py-2 font-medium pressed:text-white/70 text-white transition hover:bg-[#5865f2]/80 hover:text-white/80 pressed:[&_path]:fill-white/70 hover:[&_path]:fill-white/80",
  slots: {
    icon: "size-5",
  },
})

export const DiscordButton = ({
  className,
  children,
  ...props
}: ComponentProps<"button">) => {
  const slots = discordButtonVariants()

  return (
    <button className={slots.base({ className })} type="button" {...props}>
      <DiscordLogo className={slots.icon()} color="white" />
      {children}
    </button>
  )
}
