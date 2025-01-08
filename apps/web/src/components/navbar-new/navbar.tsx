import { type VariantProps, tv } from "@nextui-org/react"
import { auth } from "@taiyomoe/auth/server"
import { ReaderSidebarOpenButton } from "~/app/(reader)/_components/readerSidebar/ui/ReaderSidebarOpenButton"
import { NavbarCollapseButton } from "~/components/navbar-new/navbar-collapse-button"
import { NavbarLogo } from "~/components/navbar-new/navbar-logo"
import { NavbarDashboardButton } from "~/components/navbar/buttons/navbar-dashboard-button"
import { NavbarUserLibraryButton } from "~/components/navbar/buttons/navbar-user-library-button"
import { NavbarBorder } from "~/components/navbar/navbar-border"
import { NavbarGuestPopover } from "~/components/navbar/popovers/navbar-guest-popover"
import { NavbarUserPopover } from "~/components/navbar/popovers/navbar-user-popover"
import { MediasSearchMenu } from "~/components/ui/medias-search/menu/medias-search-menu"
import { SignedIn } from "~/components/utils/signed-in/server"

const navbar = tv({
  base: "relative z-20 flex h-navbar items-center justify-between px-bodyPadding",
  variants: {
    mode: {
      fixed: {},
      sticky: "sticky top-0 bg-background",
      hover: {},
    },
  },
})

type Props = {
  showCollapse?: boolean
  showLogo?: boolean
} & VariantProps<typeof navbar>

export const Navbar = async ({ mode, showCollapse, showLogo }: Props) => {
  const session = await auth()
  const slots = navbar({ mode })

  return (
    <nav className={slots}>
      {showCollapse && <NavbarCollapseButton />}
      {showLogo && <NavbarLogo />}
      <div className="ml-auto flex gap-4">
        <MediasSearchMenu />
        <NavbarUserLibraryButton />
        <SignedIn requiredRole="ADMIN">
          <NavbarDashboardButton />
        </SignedIn>
        {session && <NavbarUserPopover session={session} />}
        {!session && <NavbarGuestPopover />}
        <ReaderSidebarOpenButton />
      </div>
      {mode !== "hover" && <NavbarBorder />}
    </nav>
  )
}
