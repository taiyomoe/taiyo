import { Button } from "@nextui-org/react"
import type { MediaLimitedChapter } from "@taiyomoe/types"
import { PencilIcon } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { UpdateMediaChapterDeleteButton } from "~/components/forms/chapters/update/UpdateMediaChapterDeleteButton"

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
      <UpdateMediaChapterDeleteButton chapter={chapter} />
    </div>
  )
}
