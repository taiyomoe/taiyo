"use client";

import { Skeleton } from "@nextui-org/skeleton";
import { useAtomValue } from "jotai";

import { mediaChapterTitleAtom } from "~/atoms/mediaChapter.atoms";
import { cn } from "~/utils/cn";

type Props = {
  className: string;
};

export const DisplayMediaChapterTitle = ({ className }: Props) => {
  const title = useAtomValue(mediaChapterTitleAtom);

  if (!title) {
    return <Skeleton className="h-8 w-full rounded-lg" />;
  }

  return <p className={cn("truncate", className)}>{title}</p>;
};
