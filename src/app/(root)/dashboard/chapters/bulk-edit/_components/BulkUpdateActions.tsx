import { Button } from "@nextui-org/react"
import Link from "next/link"

type Props = {
  mediaId: string
}

export const BulkUpdateActions = ({ mediaId }: Props) => (
  <div className="flex gap-4">
    <Button as={Link} href={`bulk-edit/${mediaId}/volumes`}>
      Volumes
    </Button>
    <Button as={Link} href={`bulk-edit/${mediaId}/scans`}>
      Scans
    </Button>
  </div>
)
