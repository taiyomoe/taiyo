import { Button } from "@nextui-org/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

type Props = {
  mediaId: string
}

export const BulkUpdateActions = ({ mediaId }: Props) => {
  const pathname = usePathname()

  return (
    <div className="flex gap-4">
      <Button
        as={Link}
        href={
          pathname.includes("/scans")
            ? "volumes"
            : `bulk-edit/${mediaId}/volumes`
        }
        isDisabled={pathname.endsWith("/volumes")}
      >
        Volumes
      </Button>
      <Button
        as={Link}
        href={
          pathname.includes("/volumes") ? "scans" : `bulk-edit/${mediaId}/scans`
        }
        isDisabled={pathname.endsWith("/scans")}
      >
        Scans
      </Button>
    </div>
  )
}
