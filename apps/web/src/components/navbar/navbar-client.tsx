"use client"

import { type VariantProps, tv } from "@heroui/react"
import type { Session } from "@taiyomoe/auth/server"
import { motion, useScroll, useTransform } from "framer-motion"
import { ReaderSidebarOpenButton } from "~/app/(reader)/_components/readerSidebar/ui/ReaderSidebarOpenButton"
import { MediasSearchMenu } from "~/components/ui/medias-search/menu/medias-search-menu"
import { NavbarDashboardButton } from "./buttons/navbar-dashboard-button"
import { NavbarBorder } from "./navbar-border"
import { NavbarCollapseButton } from "./navbar-collapse-button"
import { NavbarLogo } from "./navbar-logo"
import { NavbarAuthedPopover } from "./popovers/navbar-authed-popover"

const navbarClient = tv({
  base: "relative z-20 flex h-navbar items-center justify-between px-bodyPadding",
  variants: {
    mode: {
      fixed: "",
      sticky: "sticky top-0 bg-background",
      hover: "",
      scroll: "-mb-navbar sticky top-0",
    },
  },
})

export type NavbarProps = {
  showCollapse?: boolean
  showLogo?: boolean
  session: Session | null
} & VariantProps<typeof navbarClient>

export const NavbarClient = async ({
  mode,
  showCollapse,
  showLogo,
  session,
}: NavbarProps) => {
  const slots = navbarClient({ mode })
  const { scrollY } = useScroll()
  const backgroundOpacity = useTransform(scrollY, [0, 200], [0, 1])
  const backgroundColor = useTransform(
    backgroundOpacity,
    [0, 1],
    ["rgba(22, 22, 26, 0)", "rgba(22, 22, 26, 1)"],
  )

  return (
    <motion.nav
      className={slots}
      style={{
        backgroundColor:
          mode === "scroll" ? backgroundColor : "var(--background)",
      }}
    >
      {showCollapse && <NavbarCollapseButton />}
      {showLogo && <NavbarLogo />}
      <div className="ml-auto flex gap-4">
        <MediasSearchMenu />
        {session?.user.role === "ADMIN" && <NavbarDashboardButton />}
        <NavbarAuthedPopover session={session} />
        <ReaderSidebarOpenButton />
      </div>
      {mode !== "hover" && <NavbarBorder />}
    </motion.nav>
  )
}
