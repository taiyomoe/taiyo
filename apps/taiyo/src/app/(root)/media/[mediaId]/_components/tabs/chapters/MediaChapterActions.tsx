import { Button } from "@nextui-org/button"
import { useSession } from "@taiyomoe/auth/client"
import type { MediaLimitedChapter } from "@taiyomoe/types"
import { PencilIcon } from "lucide-react"
import Link from "next/link"
import { DeleteChapterButton } from "~/components/forms/chapters/delete-chapter-button"

type Props = {
  chapter: MediaLimitedChapter
}

export const MediaChapterActions = ({ chapter }: Props) => {
  const { data: session } = useSession()

  if (session?.user.role.name !== "ADMIN") {
    return
  }

  return (
    <div className="flex flex-col">
      <Button
        as={Link}
        href={`/dashboard/chapters/edit/${chapter.id}`}
        startContent={<PencilIcon size={18} />}
        size="sm"
        variant="light"
        color="warning"
        isIconOnly
      />
      <DeleteChapterButton chapter={chapter} />
    </div>
  )
}
