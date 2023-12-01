import { notFound } from "next/navigation";

import { api } from "~/lib/trpc/server";

import { PopulateAtoms } from "../../_components/PopulateAtoms";
import { MediaChapterPage } from "./_components/MediaChapterPage";

type Props = {
  params: { chapterId: string };
};

export default async function Page(props: Props) {
  const { chapterId } = props.params;
  const mediaChapter = await api.mediaChapters.getById.query(chapterId);

  if (!mediaChapter) {
    return notFound();
  }

  return (
    <>
      <PopulateAtoms mediaChapter={mediaChapter} />
      <MediaChapterPage />
    </>
  );
}
