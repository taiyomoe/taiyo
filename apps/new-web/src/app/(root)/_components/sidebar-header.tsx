import Link from "next/link"
import { TaiyoLogo } from "~/components/logos/taiyo-logo"
import { SidebarToggleButton } from "./sidebar-toggle-button"

export const SidebarHeader = () => (
  <div className="flex justify-between border-subtle border-b p-4 transition-[padding] duration-300 group-data-[state=collapsed]:p-2">
    <div className="flex items-center gap-2">
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
    <SidebarToggleButton className="group-data-[state=collapsed]:hidden" />
  </div>
)
