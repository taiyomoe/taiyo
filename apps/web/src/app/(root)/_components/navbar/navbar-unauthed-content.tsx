import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu"
import { ArrowRightIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Avatar } from "~/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown"
import { SidebarDropdownCommonContent } from "../sidebar/sidebar-dropdown-common-content"

export const NavbarUnauthedContent = () => {
  const t = useTranslations()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="outline-none data-[state=open]:[&>div]:bg-emphasis data-[state=open]:[&_svg]:text-default"
          type="button"
        >
          <Avatar
            className="max-size-9 group-data-[state=expanded]/sidebar:max-size-10 hover:bg-emphasis hover:[&_svg]:text-default"
            width={40}
            height={40}
            radius="full"
            alt="Avatar"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48" align="end">
        <SidebarDropdownCommonContent />
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            className="flex h-8 w-full items-center justify-center gap-2 rounded-sm bg-primary px-3 py-2 font-medium text-inverted outline-none hover:bg-primary/80 hover:[&_svg]:translate-x-1"
            href="/auth/sign-in"
          >
            {t("auth.signIn.title")}
            <ArrowRightIcon className="size-4 transition-transform" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
