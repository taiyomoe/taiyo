import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { ArrowRightIcon, ChevronDownIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Avatar } from "~/components/ui/avatar"
import { buttonVariants } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown"
import { Username } from "~/components/ui/username"
import { SidebarDropdownCommonContent } from "./sidebar-dropdown-common-content"

export const SidebarUnauthedFooter = () => {
  const t = useTranslations()

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
              className="max-size-8 min-size-8 group-data-[state=expanded]:max-size-12 group-data-[state=expanded]:min-size-12 hover:opacity-80 group-hover/auth-trigger:bg-emphasis group-hover/auth-trigger:text-primary group-data-[state=open]/auth-trigger:bg-emphasis group-data-[state=collapsed]:p-1 group-data-[state=open]/auth-trigger:text-primary"
              alt="Avatar"
              width={48}
              height={48}
              radius="full"
            />
            <Username
              className="group-data-[state=collapsed]:hidden"
              user={{ name: t("global.guest") }}
            />
          </div>
          <ChevronDownIcon className="size-4 text-subtle transition-[colors,rotate] group-hover/auth-trigger:text-default group-data-[state=collapsed]:hidden group-data-[state=open]/auth-trigger:rotate-180 group-data-[state=open]/auth-trigger:text-default" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48">
        <SidebarDropdownCommonContent />
        <DropdownMenuSeparator />
        <DropdownMenuPrimitive.Item asChild>
          <Link
            href="/auth/sign-in"
            className={buttonVariants({
              className: "focus:ring-0 hover:[&_svg]:translate-x-1",
            })}
          >
            {t("auth.signIn.title")}
            <ArrowRightIcon />
          </Link>
        </DropdownMenuPrimitive.Item>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
