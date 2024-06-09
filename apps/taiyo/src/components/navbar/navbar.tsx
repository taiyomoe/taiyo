"use client"

import { Chip } from "@nextui-org/chip"
import { useSession } from "@taiyomoe/auth/client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
import { tv } from "tailwind-variants"
import { ReaderSidebarOpenButton } from "~/app/(reader)/_components/readerSidebar/ui/ReaderSidebarOpenButton"
import { CompanyLogo } from "~/components/ui/CompanyLogo"
import { MediasSearchMenu } from "~/components/ui/medias-search/menu/medias-search-menu"
import { SignedIn } from "~/components/utils/signed-in/client"
import { useDevice } from "~/hooks/useDevice"
import { useScrollOpacity } from "~/hooks/useScrollOpacity"
import { useReaderSettingsStore } from "~/stores"
import { NavbarDashboardButton } from "./buttons/navbar-dashboard-button"
import { NavbarUserLibraryButton } from "./buttons/navbar-user-library-button"
import { NavbarBorder } from "./navbar-border"
import { NavbarGuestPopover } from "./popovers/navbar-guest-popover"
import { NavbarUserPopover } from "./popovers/navbar-user-popover"

const navbar = tv({
  slots: {
    container:
      "group z-20 flex h-navbar max-h-navbar w-full flex-col justify-center p-0 child:relative md:p-[unset]",
    contentWrapper:
      "flex grow items-center justify-between px-bodyPadding transition-all",
  },
  variants: {
    mode: {
      fixed: {},
      sticky: {
        container: "sticky top-0",
      },
      hover: {
        container: "child:-top-navbar fixed top-0",
        contentWrapper: "group-hover:top-0",
      },
      scroll: {
        container: "-mb-navbar sticky top-0",
      },
    },
    sidebarState: {
      hide: {
        container: "!p-0",
      },
      show: {},
    },
    sidebarSide: {
      left: {
        container: "pl-readerSidebar",
      },
      right: {
        container: "pr-readerSidebar",
      },
    },
  },
})

export const Navbar = () => {
  const { sidebar, navbarMode } = useReaderSettingsStore()
  const pathname = usePathname()
  const device = useDevice()
  const { data: session } = useSession()
  const opacity = useScrollOpacity({ min: 0, max: 100 })
  const supportsSidebar =
    pathname.includes("/chapter/") && device?.isAboveTablet
  const mode = useMemo(() => {
    if (pathname === "/" || pathname.includes("/media/")) return "scroll"
    if (pathname.includes("/chapter/")) return navbarMode
    return "sticky"
  }, [pathname, navbarMode])
  const slots = navbar({
    mode,
    sidebarState: supportsSidebar ? sidebar.state : undefined,
    sidebarSide: supportsSidebar ? sidebar.side : undefined,
  })

  return (
    <div className={slots.container()}>
      <nav
        className={slots.contentWrapper()}
        style={{
          backgroundColor:
            mode === "scroll"
              ? `rgba(22,22,26,${opacity})`
              : "var(--background)",
        }}
      >
        <Link
          href="/"
          className="flex select-none items-center gap-2 md:hidden"
        >
          <CompanyLogo company="taiyo" width={35} priority />
        </Link>
        <Link
          href="/"
          className="hidden select-none items-center gap-3 md:flex"
        >
          <CompanyLogo company="taiyo" width={35} priority />
          <p className="font-semibold text-xl">Taiyō</p>
          <Chip color="primary" size="sm">
            ALPHA
          </Chip>
        </Link>
        <div className="flex gap-4">
          <MediasSearchMenu />
          <NavbarUserLibraryButton />
          <SignedIn requiredRole="ADMIN">
            <NavbarDashboardButton />
          </SignedIn>
          {session && <NavbarUserPopover session={session} />}
          {!session && <NavbarGuestPopover />}
          <ReaderSidebarOpenButton />
        </div>
      </nav>
      <NavbarBorder />
    </div>
  )
}
