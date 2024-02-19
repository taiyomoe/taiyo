import { Card, CardBody } from "@nextui-org/card"
import type { MediaLimitedChapter } from "@taiyomoe/types"
import Link from "next/link"
import { tv } from "tailwind-variants"
import { MediaChapterScans } from "~/components/ui/MediaChapterScans"
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils"
import { MediaChapterCardUploadedTime } from "../../../../../../../../components/ui/MediaChapterUploadedTime"
import { MediaChapterUploader } from "../../../../../../../../components/ui/MediaChapterUploader"
import { MediaChapterCardCommentsCount } from "./MediaChapterCardCommentsCount"
import { MediaChapterCardPath } from "./MediaChapterCardPath"
import { MediaChapterCardViews } from "./MediaChapterCardViews"

type Props = {
  chapter: MediaLimitedChapter
  order: "unique" | "first" | "middle" | "last"
}

const mediaChapterCard = tv({
  slots: {
    container: "flex w-full gap-2",
    card: "w-full",
    cardBody: "p-3",
    contentWrapper:
      "grid grid-cols-smChapterLayout md:grid-cols-mdChapterLayout grid-rows-3 gap-1 md:grid-rows-2",
    chapterLink: "order-1 col-span-2 md:col-span-1",
    chapterTitle: "w-full truncate text-sm font-semibold",
    chapterUploadedTime: "order-6 md:order-2 col-span-2 md:col-span-1",
    chapterViews: "order-4 md:order-3",
    chapterScans: "order-3 md:order-4 col-span-2 md:col-span-1",
    chapterUploader: "order-5",
    chapterComments: "order-2 md:order-6",
  },
  variants: {
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

export const MediaChapterCard = ({ chapter, order }: Props) => {
  const slots = mediaChapterCard({ order })

  return (
    <div className={slots.container()}>
      <MediaChapterCardPath order={order} />
      <Card className={slots.card()} radius="sm">
        <CardBody className={slots.cardBody()}>
          <div className={slots.contentWrapper()}>
            <Link
              className={slots.chapterLink()}
              href={MediaChapterUtils.getUrl(chapter)}
            >
              <p className={slots.chapterTitle()}>
                {MediaChapterUtils.getTitle(chapter)}
              </p>
            </Link>
            {/* UPLOADED TIME */}
            <div className={slots.chapterUploadedTime()}>
              <MediaChapterCardUploadedTime chapter={chapter} />
            </div>
            {/* VIEWS */}
            <div className={slots.chapterViews()}>
              <MediaChapterCardViews />
            </div>
            {/* SCANS */}
            <div className={slots.chapterScans()}>
              <MediaChapterScans scans={chapter.scans} />
            </div>
            {/* UPLOADER */}
            <div className={slots.chapterUploader()}>
              <MediaChapterUploader uploader={chapter.uploader} />
            </div>
            {/* COMMENTS */}
            <div className={slots.chapterComments()}>
              <MediaChapterCardCommentsCount />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
