import { useEffect } from "react";
import { useSession } from "next-auth/react";

import { api } from "~/lib/trpc/client";
import { useReaderStore } from "~/stores";

export const useChapterProgression = () => {
  const { chapter, currentPageNumber } = useReaderStore();
  const { mutate } = api.history.updateProgression.useMutation();
  const { status } = useSession();

  useEffect(() => {
    const currentPageId = chapter?.pages[(currentPageNumber ?? 0) - 1]?.id;

    if (!currentPageId || status !== "authenticated") return;

    mutate({
      chapterId: chapter.id,
      pageId: currentPageId,
    });
  }, [chapter?.id, chapter?.pages, currentPageNumber, mutate, status]);
};
