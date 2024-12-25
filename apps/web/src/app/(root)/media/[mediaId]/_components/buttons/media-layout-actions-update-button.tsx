import { Button } from "@nextui-org/button"
import { FileEditIcon } from "lucide-react"
import Link from "next/link"

type Props = {
  media: { id: string }
}

export const MediaLayoutActionsUpdateButton = ({ media }: Props) => (
  <Button
    as={Link}
    href={`/dashboard/medias/edit/${media.id}`}
    startContent={<FileEditIcon className="h-6 w-6" />}
    color="warning"
    radius="sm"
    isIconOnly
  />
)
