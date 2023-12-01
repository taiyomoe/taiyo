import Link from "next/link";
import { Card, CardBody } from "@nextui-org/card";
import { tv } from "tailwind-variants";

import { MediaChapterScans } from "~/components/ui/MediaChapterScans";
import type { MediaLimitedChapter } from "~/lib/types";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";

import { MediaChapterUploader } from "../../../../../../../../components/ui/MediaChapterUploader";
import { MediaChapterCardCommentsCount } from "./MediaChapterCardCommentsCount";
import { MediaChapterCardPath } from "./MediaChapterCardPath";
import { MediaChapterCardUploadedTime } from "./MediaChapterCardUploadedTime";
import { MediaChapterCardViews } from "./MediaChapterCardViews";

type Props = {
  chapter: MediaLimitedChapter;
  order: "unique" | "first" | "middle" | "last";
};

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
});

export const MediaChapterCard = ({ chapter, order }: Props) => {
  const {
    container,
    card,
    cardBody,
    contentWrapper,
    chapterLink,
    chapterTitle,
    chapterUploadedTime,
    chapterViews,
    chapterScans,
    chapterUploader,
    chapterComments,
  } = mediaChapterCard({ order });

  return (
    <div className={container()}>
      <MediaChapterCardPath order={order} />
      <Card className={card()} radius="sm">
        <CardBody className={cardBody()}>
          <div className={contentWrapper()}>
            <Link
              className={chapterLink()}
              href={MediaChapterUtils.getUrl(chapter)}
            >
              <p className={chapterTitle()}>
                {MediaChapterUtils.getTitle(chapter)}
              </p>
            </Link>
            {/* UPLOADED TIME */}
            <div className={chapterUploadedTime()}>
              <MediaChapterCardUploadedTime chapter={chapter} />
            </div>
            {/* VIEWS */}
            <div className={chapterViews()}>
              <MediaChapterCardViews />
            </div>
            {/* SCANS */}
            <div className={chapterScans()}>
              <MediaChapterScans scans={chapter.scans} />
            </div>
            {/* UPLOADER */}
            <div className={chapterUploader()}>
              <MediaChapterUploader uploader={chapter.uploader} />
            </div>
            {/* COMMENTS */}
            <div className={chapterComments()}>
              <MediaChapterCardCommentsCount />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
