import { Chip } from "@nextui-org/chip"
import { auth } from "@taiyomoe/auth/server"
import Link from "next/link"
import { ReaderSidebarOpenButton } from "~/app/(reader)/_components/readerSidebar/ui/ReaderSidebarOpenButton"
import { NavbarDashboardButton } from "~/components/navbar/buttons/navbar-dashboard-button"
import { NavbarUserLibraryButton } from "~/components/navbar/buttons/navbar-user-library-button"
import { NavbarGuestPopover } from "~/components/navbar/popovers/navbar-guest-popover"
import { NavbarUserPopover } from "~/components/navbar/popovers/navbar-user-popover"
import { CompanyLogo } from "~/components/ui/CompanyLogo"
import { MediasSearchMenu } from "~/components/ui/medias-search/menu/medias-search-menu"
import { SignedIn } from "~/components/utils/signed-in/server"

type Props = {
  mode: "fixed" | "sticky" | "hover"
  showCollapse?: boolean
  showLogo?: boolean
}

export const Navbar = async ({ mode, showCollapse, showLogo }: Props) => {
  const session = await auth()

  return (
    <nav className="flex h-navbar items-center px-bodyPadding">
      {showLogo && (
        <Link href="/" className="flex select-none items-center gap-3">
          <CompanyLogo company="taiyo" width={35} priority />
          <p className="hidden font-semibold text-xl md:block">Taiyō</p>
          <Chip className="hidden md:flex" color="primary" size="sm">
            ALPHA
          </Chip>
        </Link>
      )}
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
  )
}
