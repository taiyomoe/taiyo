import Link from "next/link";
import { Card, CardBody } from "@nextui-org/card";
import { tv } from "tailwind-variants";

import { MediaChapterScans } from "~/components/ui/MediaChapterScans";
import { MediaChapterUploader } from "~/components/ui/MediaChapterUploader";
import type { MediaLimitedChapter } from "~/lib/types";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";

import { MediaChapterCardPath } from "./MediaChapterCardPath";
import { MediaChapterCardUploadedTime } from "./MediaChapterCardUploadedTime";

type Props = {
  chapter: MediaLimitedChapter;
  order: "unique" | "first" | "middle" | "last";
};

const mediaChapterCardTemporary = tv({
  slots: {
    container: "flex w-full gap-2",
    card: "w-full",
    cardBody: "p-3",
    contentWrapper: "grid grid-cols-4 grid-rows-2 gap-1",
    chapterLink: "col-span-3",
    chapterTitle: "w-full truncate text-sm font-semibold",
    chapterUploadedTime: "col-span-1",
    chapterScans: "col-span-3",
    chapterUploader: "col-span-1",
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

export const MediaChapterCardTemporary = ({ chapter, order }: Props) => {
  const {
    container,
    card,
    cardBody,
    contentWrapper,
    chapterLink,
    chapterTitle,
    chapterUploadedTime,
    chapterScans,
    chapterUploader,
  } = mediaChapterCardTemporary({ order });

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
            {/* SCANS */}
            <div className={chapterScans()}>
              <MediaChapterScans scans={chapter.scans} />
            </div>
            {/* UPLOADER */}
            <div className={chapterUploader()}>
              <MediaChapterUploader
                className="justify-end"
                uploader={chapter.uploader}
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
