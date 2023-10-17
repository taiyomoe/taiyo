"use client";

import Link from "next/link";
import { Skeleton } from "@nextui-org/skeleton";
import { useAtomValue } from "jotai";

import { mediaChapterTitleAtom } from "~/atoms/mediaChapter.atoms";
import { cn } from "~/utils/cn";

type Props = {
  className: string;
};

export const DisplayMediaChapterTitle = ({ className }: Props) => {
  const { id, title, isMediaTitle } = useAtomValue(mediaChapterTitleAtom);

  if (!id || !title) {
    return <Skeleton className="h-8 w-full rounded-lg" />;
  }

  if (isMediaTitle) {
    return (
      <Link
        className={cn("truncate underline-offset-2 hover:underline", className)}
        href={`/media/${id}`}
      >
        {title}
      </Link>
    );
  }

  return <p className={cn("truncate", className)}>{title}</p>;
};
