"use client"

import { MenuIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "react-aria-components"
import { TaiyoLogo } from "~/components/logos/taiyo-logo"
import { useSession } from "~/stores/auth.store"
import { NavbarAuthedContent } from "./navbar-authed-content"
import { NavbarUnauthedContent } from "./navbar-unauthed-content"
import { useSidebar } from "./sidebar-context"

export const Navbar = () => {
  const session = useSession()
  const { state, isMobile, setOpenMobile } = useSidebar()

  return (
    <div
      className="group/navbar flex h-[49] items-center justify-between border-subtle border-b bg-muted px-4 py-2 transition-[height] duration-300 data-[state=expanded]:h-[57] md:justify-end"
      data-state={isMobile ? "collapsed" : state}
    >
      <div className="-translate-x-1/2 absolute left-1/2 flex items-center gap-2 md:hidden">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 font-bold text-xl"
        >
          <TaiyoLogo className="size-8" />
          <span className="transition-opacity duration-300 ease-in-out group-data-[state=collapsed]:hidden group-data-[state=collapsed]:opacity-0 group-data-[state=expanded]:opacity-100">
            Taiyō
          </span>
        </Link>
        <div className="rounded-full border bg-emphasis px-2 py-1 text-xs uppercase group-data-[state=collapsed]:hidden">
          Alpha
        </div>
      </div>
      <div className="flex items-center gap-2 md:hidden">
        <Button onPress={() => setOpenMobile(true)}>
          <MenuIcon className="size-6 text-subtle transition-colors hover:text-default" />
        </Button>
      </div>
      {session && <NavbarAuthedContent />}
      {!session && <NavbarUnauthedContent />}
    </div>
  )
}
