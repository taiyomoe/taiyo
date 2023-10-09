import Link from "next/link";

import { MediaChapterUtils } from "~/utils/MediaChapterUtils";
import { serverApi } from "~/utils/serverApi";
import { PopulateAtoms } from "../../_components/PopulateAtoms";

export const runtime = "edge";

type Props = {
  params: { chapterId: string };
};

export default async function MediaChapterPage(props: Props) {
  const { chapterId } = props.params;
  const mediaChapter = await serverApi.mediaChapters.getById(chapterId);
  const { comments, pages } = mediaChapter;

  return (
    <div>
      <PopulateAtoms mediaChapter={mediaChapter} />
      <p>chapterId: {chapterId}</p>
      <p>comments: {comments.length}</p>
      <hr />
      {pages.map((page, i) => (
        <p key={i}>
          Page {i + 1}:{" "}
          <Link
            className="text-blue-400"
            href={MediaChapterUtils.getPageUrl(mediaChapter, page)}
          >
            link
          </Link>
        </p>
      ))}
    </div>
  );
}
