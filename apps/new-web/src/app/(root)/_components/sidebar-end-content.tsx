import Link from "next/link"
import { DiscordLogo } from "~/components/logos/discord-logo"
import { discordButtonVariants } from "~/components/ui/discord-button"

export const SidebarEndContent = () => {
  const discordButtonSlots = discordButtonVariants()

  return (
    <div className="absolute bottom-[97] w-full space-y-4 p-4 transition-[padding,bottom] duration-300 group-data-[state=collapsed]:bottom-[49] group-data-[state=collapsed]:p-2">
      <Link
        href="https://discord.gg/RYbnyeWcM2"
        className={discordButtonSlots.base({
          className:
            "transition-[background,margin,padding,height] group-data-[state=collapsed]:h-fit group-data-[state=collapsed]:p-1",
        })}
      >
        <DiscordLogo className={discordButtonSlots.icon()} color="white" />
        <span className="group-data-[state=collapsed]:hidden">Discord</span>
      </Link>
    </div>
  )
}
