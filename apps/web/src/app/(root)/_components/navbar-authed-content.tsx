import { authClient } from "@taiyomoe/auth/client"
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
import { useAuth } from "~/stores/auth.store"
import { SidebarDropdownCommonContent } from "./sidebar-dropdown-common-content"

export const NavbarAuthedContent = () => {
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
        <button className="outline-none" type="button">
          <Avatar
            src={user!.image}
            className="max-size-9 group-data-[state=expanded]/navbar:max-size-10 hover:opacity-80"
            width={40}
            height={40}
            radius="full"
            alt="Avatar"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48" align="end">
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
