import { Button } from "@nextui-org/react"
import { UploadIcon } from "lucide-react"
import Link from "next/link"

type Props = {
  media: { id: string }
}

export const MediaChapterUploadPageButton = ({ media: { id } }: Props) => (
  <Button
    as={Link}
    href={`/dashboard/chapters/upload?mediaId=${id}`}
    startContent={<UploadIcon className="h-6 w-6" />}
    color="success"
    radius="sm"
    isIconOnly
  />
)
