import { Button } from "@nextui-org/button"
import { GaugeIcon } from "lucide-react"
import Link from "next/link"

export const NavbarDashboardButton = () => (
  <Button
    as={Link}
    className="-ml-2 hidden sm:inline-flex"
    href="/dashboard"
    startContent={<GaugeIcon />}
    variant="light"
    color="warning"
    isIconOnly
  />
)
