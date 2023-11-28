import { useEffect } from "react";
import { useSession } from "next-auth/react";

import { useChapterNavigation } from "~/hooks/useChapterNavigation";
import { api } from "~/lib/trpc/client";

export const useChapterProgression = () => {
  const { chapter, currentPage } = useChapterNavigation();
  const { mutate } = api.history.updateProgression.useMutation();
  const { status } = useSession();

  useEffect(() => {
    const currentPageId = chapter?.pages[(currentPage ?? 0) - 1]?.id;

    if (!currentPageId || status !== "authenticated") return;

    mutate({
      chapterId: chapter.id,
      pageId: currentPageId,
    });
  }, [chapter?.id, chapter?.pages, currentPage, mutate, status]);
};
