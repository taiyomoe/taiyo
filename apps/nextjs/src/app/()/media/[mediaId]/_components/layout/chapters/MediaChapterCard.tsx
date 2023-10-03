import Link from "next/link";
import { Card, CardBody } from "@nextui-org/card";
import { Skeleton } from "@nextui-org/skeleton";

import type { MediaChapterWithUser } from "@taiyo/db";

import { cn } from "~/utils/cn";
import { MediaChapterUtils } from "~/utils/MediaChapterUtils";
import { DisplayMediaChapterCommentsCount } from "../../ui/DisplayMediaChapterCommentsCount";
import { DisplayMediaChapterUploadedTime } from "../../ui/DisplayMediaChapterUploadedTime";
import { DisplayMediaChapterUploader } from "../../ui/DisplayMediaChapterUploader";
import { DisplayMediaChapterViews } from "../../ui/DisplayMediaChapterViews";
import { MediaChapterCardPath } from "./MediaChapterCardPath";

type Props = {
  chapter: MediaChapterWithUser;
  order: "unique" | "first" | "middle" | "last";
};

export const MediaChapterCard = ({ chapter, order }: Props) => {
  return (
    <div className="flex w-full gap-2">
      <MediaChapterCardPath order={order} />
      <Card
        className={cn("w-full", {
          "rounded-b-none": order === "first",
          "rounded-t-none": order === "middle" || order === "last",
        })}
        radius="sm"
      >
        <CardBody className="p-3">
          <div className="grid-cols-mediaChapterCardLayout grid grid-rows-3 gap-1 md:grid-rows-2">
            <Link
              className="order-1 col-span-10 md:col-span-9"
              href={MediaChapterUtils.getUrl(chapter)}
            >
              <p className="w-full truncate text-sm font-semibold">
                {MediaChapterUtils.getTitle(chapter)}
              </p>
            </Link>
            {/* UPLOADED TIME */}
            <div className="order-6 col-span-4 md:order-2 md:col-span-2">
              <DisplayMediaChapterUploadedTime chapter={chapter} />
            </div>
            {/* VIEWS */}
            <div className="order-4 col-span-3 md:order-3 md:col-span-1">
              <DisplayMediaChapterViews />
            </div>
            {/* SCANS */}
            <div className="order-3 col-span-9 md:order-4">
              <Skeleton className="h-full w-full rounded" />
            </div>
            {/* UPLOADER */}
            <div className="order-5 col-span-8 md:col-span-2">
              <DisplayMediaChapterUploader user={chapter.user} />
            </div>
            {/* COMMENTS */}
            <div className="order-2 col-span-2 md:order-6 md:col-span-1">
              <DisplayMediaChapterCommentsCount />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
