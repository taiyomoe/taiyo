import { Button } from "@nextui-org/button"
import { useSession } from "@taiyomoe/auth/client"
import { GaugeIcon } from "lucide-react"
import Link from "next/link"

export const NavbarDashboardButton = () => {
  const { data: session } = useSession()

  if (!session || session.user.role.name !== "ADMIN") return null

  return (
    <Button
      as={Link}
      className="-ml-2"
      href="/dashboard"
      startContent={<GaugeIcon />}
      variant="light"
      color="warning"
      isIconOnly
    />
  )
}
