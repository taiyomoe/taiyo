import { Button } from "@nextui-org/button"
import { RefreshCwIcon } from "lucide-react"
import Link from "next/link"

type Props = {
  media: { id: string }
}

export const MediaLayoutActionsSyncButton = ({ media: { id } }: Props) => (
  <Button
    as={Link}
    href={`/dashboard/medias/sync?mediaId=${id}`}
    startContent={<RefreshCwIcon className="h-6 w-6" />}
    color="warning"
    radius="sm"
    isIconOnly
  />
)
