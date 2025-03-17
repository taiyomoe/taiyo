import { authClient } from "@taiyomoe/auth/client"
import { ChevronDownIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { toast } from "sonner"
import { IdCardIcon } from "~/components/icons/id-card-icon"
import { SettingsIcon } from "~/components/icons/settings-icon"
import { SignOutIcon } from "~/components/icons/sign-out-icon"
import { Avatar } from "~/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown"
import { Username } from "~/components/ui/username"
import { useAuth } from "~/stores/auth.store"
import { SidebarDropdownCommonContent } from "./sidebar-dropdown-common-content"

export const SidebarAuthedFooter = () => {
  const t = useTranslations("global")
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await authClient.signOut()
    signOut()
    toast.success("Signed out successfully")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group/auth-trigger focusable flex w-full items-center justify-between rounded p-2 hover:bg-subtle data-[state=open]:bg-subtle group-data-[state=collapsed]:rounded-full group-data-[state=collapsed]:p-0"
          style={{ transition: "padding 300ms, background 200ms" }}
        >
          <div className="flex items-center gap-2">
            <Avatar
              src={user!.image}
              className="max-size-8 min-size-8 group-data-[state=expanded]:max-size-12 group-data-[state=expanded]:min-size-12 hover:opacity-80 group-data-[state=open]/auth-trigger:opacity-80"
              alt="Avatar"
              width={48}
              height={48}
              radius="full"
            />
            <Username
              className="group-data-[state=collapsed]:hidden"
              user={user!}
            />
          </div>
          <ChevronDownIcon className="size-4 text-subtle transition-[colors,rotate] group-hover/auth-trigger:text-default group-data-[state=collapsed]:hidden group-data-[state=open]/auth-trigger:rotate-180 group-data-[state=open]/auth-trigger:text-default" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48">
        <DropdownMenuItem animatedIcon={IdCardIcon} asChild>
          <Link href="/profile">{t("myProfile")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem animatedIcon={SettingsIcon} asChild>
          <Link href="/settings">{t("settings")}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <SidebarDropdownCommonContent />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          animatedIcon={SignOutIcon}
          onClick={handleSignOut}
          color="error"
        >
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
