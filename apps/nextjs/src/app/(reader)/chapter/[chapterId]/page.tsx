import { serverApi } from "~/utils/serverApi";
import { PopulateAtoms } from "../../_components/PopulateAtoms";
import { DisplayMediaChapterPage } from "./_components/DisplayMediaChapterPage";

export const runtime = "edge";

type Props = {
  params: { chapterId: string };
};

export default async function MediaChapterPage(props: Props) {
  const { chapterId } = props.params;
  const mediaChapter = await serverApi.mediaChapters.getById(chapterId);

  return (
    <>
      <PopulateAtoms mediaChapter={mediaChapter} />
      <DisplayMediaChapterPage />
    </>
  );
}
