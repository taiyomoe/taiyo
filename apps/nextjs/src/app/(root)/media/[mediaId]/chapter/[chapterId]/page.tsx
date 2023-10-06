import Link from "next/link";

import { MediaChapterUtils } from "~/utils/MediaChapterUtils";
import { serverApi } from "~/utils/serverApi";

export const runtime = "edge";

type Props = {
  params: { mediaId: string; chapterId: string };
};

const MediaChapterPage = async ({ params: { mediaId, chapterId } }: Props) => {
  const mediaChapter = await serverApi.medias.getMediaChapterById(chapterId);
  const { comments, pages } = mediaChapter;

  return (
    <div>
      <p>mediaId: {mediaId}</p>
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
};

export default MediaChapterPage;
