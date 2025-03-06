import { Chip } from "@heroui/chip"
import Link from "next/link"
import { CompanyLogo } from "~/components/ui/CompanyLogo"

export const NavbarLogo = () => (
  <Link href="/" className="flex select-none items-center gap-3">
    <CompanyLogo company="taiyo" width={35} priority />
    <p className="hidden font-semibold text-xl md:block">Taiyō</p>
    <Chip className="hidden md:flex" color="primary" size="sm">
      ALPHA
    </Chip>
  </Link>
)
