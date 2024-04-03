import { Card, CardBody } from "@nextui-org/card"
import type { MediaLimitedChapter } from "@taiyomoe/types"
import { MediaChapterUtils } from "@taiyomoe/utils"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"
import { tv } from "tailwind-variants"
import { MediaChapterScans } from "~/components/ui/MediaChapterScans"
import { MediaChapterCardUploadedTime } from "~/components/ui/MediaChapterUploadedTime"
import { MediaChapterUploader } from "~/components/ui/MediaChapterUploader"
import { MediaChapterActions } from "../MediaChapterActions"
import { MediaChapterCardPath } from "./MediaChapterCardPath"
import { MediaChapterCardProgressionButton } from "./MediaChapterCardProgressionButton"

type Props = {
  chapter: MediaLimitedChapter
  order: "unique" | "first" | "middle" | "last"
}

const mediaChapterCardTemporary = tv({
  slots: {
    container: "flex w-full gap-2",
    card: "w-full",
    cardBody: "p-3",
    contentWrapper: "grid grid-cols-5 grid-rows-2 gap-1",
    titleWrapper: "col-span-3 flex gap-3",
    title: "line-clamp-1 font-semibold text-sm",
    uploadedTime: "col-span-2 truncate",
    scans: "col-span-3",
    uploader: "col-span-2",
  },
  variants: {
    completed: {
      null: {},
      true: {
        card: "pl-[2px]",
      },
      false: {
        card: "rounded-md border-primary border-l-2",
      },
    },
    order: {
      unique: {},
      first: {
        card: "rounded-b-none",
      },
      middle: {
        card: "rounded-t-none",
      },
      last: {
        card: "rounded-t-none",
      },
    },
  },
})

export const MediaChapterCardTemporary = ({ chapter, order }: Props) => {
  const [completed, setCompleted] = useState(chapter.completed ?? false)
  const { data: session } = useSession()
  const slots = mediaChapterCardTemporary({
    completed: session ? completed : "null",
    order,
  })

  return (
    <div className={slots.container()}>
      <MediaChapterCardPath order={order} />
      <Card className={slots.card()} radius="sm">
        <CardBody className={slots.cardBody()}>
          <div className={slots.contentWrapper()}>
            <div className={slots.titleWrapper()}>
              <MediaChapterCardProgressionButton
                chapter={chapter}
                completed={completed}
                setCompleted={setCompleted}
              />
              <Link href={MediaChapterUtils.getUrl(chapter)}>
                <p className={slots.title()}>
                  {MediaChapterUtils.getTitle(chapter)}
                </p>
              </Link>
            </div>
            {/* UPLOADED TIME */}
            <div className={slots.uploadedTime()}>
              <MediaChapterCardUploadedTime chapter={chapter} />
            </div>
            {/* SCANS */}
            <div className={slots.scans()}>
              <MediaChapterScans scans={chapter.scans} />
            </div>
            {/* UPLOADER */}
            <div className={slots.uploader()}>
              <MediaChapterUploader
                className="justify-end"
                uploader={chapter.uploader}
              />
            </div>
          </div>
        </CardBody>
      </Card>
      <MediaChapterActions chapter={chapter} />
    </div>
  )
}
