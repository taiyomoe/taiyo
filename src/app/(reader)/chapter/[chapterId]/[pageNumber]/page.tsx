import { notFound } from "next/navigation";

import { PopulateAtoms } from "~/app/(reader)/_components/PopulateAtoms";
import { api } from "~/lib/trpc/server";

import { DisplayMediaChapterPage } from "../_components/DisplayMediaChapterPage";

type Props = {
  params: { chapterId: string };
};

export default async function MediaChapterPage(props: Props) {
  const { chapterId } = props.params;
  const mediaChapter = await api.mediaChapters.getById.query(chapterId);

  if (!mediaChapter) {
    return notFound();
  }

  return (
    <>
      <PopulateAtoms mediaChapter={mediaChapter} />
      <DisplayMediaChapterPage />
    </>
  );
}
