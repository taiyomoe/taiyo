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
    contentWrapper: "grid grid-cols-5 grid-rows-2 gap-1",
    chapterLink: "col-span-3",
    chapterTitle: "w-full truncate text-sm font-semibold",
    chapterUploadedTime: "col-span-2",
    chapterScans: "col-span-3",
    chapterUploader: "col-span-2",
  },
  variants: {
    completed: {
      false: {
        cardBody: "border-l-2 border-primary rounded-md",
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
});

export const MediaChapterCardTemporary = ({ chapter, order }: Props) => {
  const slots = mediaChapterCardTemporary({
    completed: chapter.completed ?? false,
    order,
  });

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
            {/* SCANS */}
            <div className={slots.chapterScans()}>
              <MediaChapterScans scans={chapter.scans} />
            </div>
            {/* UPLOADER */}
            <div className={slots.chapterUploader()}>
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
