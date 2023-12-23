"use client";

import Link from "next/link";
import { Skeleton } from "@nextui-org/skeleton";

import { cn } from "~/lib/utils/cn";
import { useReaderStore } from "~/stores";

type Props = {
  className: string;
};

export const ReaderSidebarMediaTitle = ({ className }: Props) => {
  const { chapter } = useReaderStore();

  if (!chapter) {
    return <Skeleton className="h-8 w-full rounded-lg" />;
  }

  return (
    <Link
      className={cn(
        "media-title truncate underline-offset-2 hover:underline",
        className,
      )}
      href={`/media/${chapter.media.id}`}
    >
      {chapter.media.title}
    </Link>
  );
};
