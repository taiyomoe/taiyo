import { Button } from "@nextui-org/react"
import type { MediaLimitedChapter } from "@taiyomoe/types"
import { PencilIcon } from "lucide-react"
import Link from "next/link"
import { DeleteChapterButton } from "~/components/forms/chapters/delete-chapter-button"
import { SignedIn } from "~/components/utils/signed-in/client"

type Props = {
  chapter: MediaLimitedChapter
}

export const MediaChaptersTabRowActions = ({ chapter }: Props) => {
  return (
    <div className="flex flex-col">
      <SignedIn requiredPermissions={["mediaChapters:update:any"]}>
        <Button
          as={Link}
          href={`/dashboard/chapters/edit/${chapter.id}`}
          startContent={<PencilIcon size={18} />}
          size="sm"
          variant="light"
          color="warning"
          isIconOnly
        />
      </SignedIn>
      <SignedIn requiredPermissions={["mediaChapters:delete:any"]}>
        <DeleteChapterButton chapter={chapter} />
      </SignedIn>
    </div>
  )
}
