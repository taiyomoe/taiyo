import { ArrowRightIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useRef } from "react"
import { SettingsGearIcon } from "~/components/icons/settings-gear-icon"
import { buttonVariants } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown"
import { SidebarDropdownCommonContent } from "./sidebar-dropdown-common-content"

export const SidebarUnauthedFooter = () => {
  const t = useTranslations()
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="flex gap-4">
      <Link
        href="/auth/sign-in"
        className={buttonVariants({
          className:
            "focus:ring-0 group-data-[state=collapsed]:hidden hover:[&_svg]:translate-x-1",
        })}
      >
        {t("auth.signIn.title")}
        <ArrowRightIcon />
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            ref={buttonRef}
            className="group/auth-trigger flex w-fit items-center justify-between rounded p-2 text-subtle outline-none hover:bg-subtle hover:text-primary data-[state=open]:bg-subtle data-[state=open]:text-primary group-data-[state=collapsed]:ml-[1.5px] group-data-[state=collapsed]:p-1"
            style={{
              transition:
                "color 200ms, background 200ms, margin 300ms, padding 300ms",
            }}
            type="button"
          >
            <SettingsGearIcon parentRef={buttonRef} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-48">
          <SidebarDropdownCommonContent />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
