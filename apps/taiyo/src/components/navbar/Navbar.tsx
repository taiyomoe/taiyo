"use client"

import { Chip } from "@nextui-org/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { tv } from "tailwind-variants"
import { ReaderSidebarOpenButton } from "~/app/(reader)/_components/readerSidebar/ui/ReaderSidebarOpenButton"
import { MediaSearch } from "~/components/navbar/search/MediaSearch"
import { CompanyLogo } from "~/components/ui/CompanyLogo"
import { useDevice } from "~/hooks/useDevice"
import { useReaderSettingsStore } from "~/stores"
import { NavbarBorder } from "./NavbarBorder"
import { NavbarDashboardButton } from "./buttons/NavbarDashboardButton"
import { NavbarUserLibraryButton } from "./buttons/NavbarUserLibraryButton"

const navbar = tv({
  slots: {
    container:
      "h-navbar max-h-navbar w-full flex flex-col justify-center z-20 group child:relative p-0 md:p-[unset] data-[sidebar-state=hide]:!p-0 data-[sidebar-side=left]:pl-readerSidebar data-[sidebar-side=right]:pr-readerSidebar",
    contentWrapper:
      "items-center px-bodyPadding flex grow justify-between bg-background transition-all",
  },
  variants: {
    mode: {
      fixed: {},
      sticky: {
        container: "sticky top-0",
      },
      hover: {
        container: "fixed top-0 child:-top-navbar",
        contentWrapper: "group-hover:top-0",
      },
    },
  },
})

type Props = {
  popover: JSX.Element
}

export const Navbar = ({ popover }: Props) => {
  const { sidebar, navbarMode } = useReaderSettingsStore()
  const pathname = usePathname()
  const device = useDevice()

  const slots = navbar({
    mode: pathname.includes("/chapter/") ? navbarMode : "sticky",
  })

  return (
    <div
      className={slots.container()}
      data-sidebar-state={
        pathname.includes("/chapter/") && device?.isAboveTablet
          ? sidebar.state
          : undefined
      }
      data-sidebar-side={
        pathname.includes("/chapter/") && device?.isAboveTablet
          ? sidebar.side
          : undefined
      }
    >
      <nav className={slots.contentWrapper()}>
        <Link
          href="/"
          className="flex md:hidden items-center gap-2 select-none"
        >
          <CompanyLogo company="taiyo" width={35} priority />
        </Link>
        <Link
          href="/"
          className="hidden md:flex items-center gap-3 select-none"
        >
          <CompanyLogo company="taiyo" width={35} priority />
          <p className="text-xl font-semibold">Taiyō</p>
          <Chip color="primary" size="sm">
            ALPHA
          </Chip>
        </Link>
        <div className="flex gap-4">
          <MediaSearch />
          <NavbarUserLibraryButton />
          <NavbarDashboardButton />
          {popover}
          <ReaderSidebarOpenButton />
        </div>
      </nav>
      <NavbarBorder />
    </div>
  )
}
