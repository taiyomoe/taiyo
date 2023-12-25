import Link from "next/link";

import { MediaChapterPageOverlayScrollButton } from "~/app/(reader)/_components/readerSidebar/MediaChapterPageOverlayScrollButton";
import { ReaderSidebarOpenButton } from "~/components/navbar/ReaderSidebarOpenButton";
import { useDevice } from "~/hooks/useDevice";
import { MediaUtils } from "~/lib/utils/media.utils";
import { useReaderSettingsStore, useReaderStore } from "~/stores";

import { ReaderSettingsMediaChapterDropdown } from "./readerSidebar/ui/ReaderSettingsMediaChapterDropdown";

export const MediaChapterPageOverlay = () => {
  const { page } = useReaderSettingsStore();
  const { chapter } = useReaderStore();
  const { isAboveTablet } = useDevice();

  if (page.mode === "single" || isAboveTablet || !chapter) {
    return null;
  }

  return (
    <>
      <div
        className="fixed top-0 z-10 -mt-[100px] h-[100px] w-full space-y-4 bg-black bg-opacity-60 px-bodyPadding py-2 transition-all data-[show=true]:mt-0"
        data-show={page.overlay === "show"}
      >
        <Link
          href={MediaUtils.getUrl(chapter.media)}
          className="line-clamp-1 text-center text-2xl font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] hover:underline"
        >
          {chapter.media.title}
        </Link>
        <ReaderSettingsMediaChapterDropdown />
      </div>
      <div
        className="fixed bottom-0 z-10 -mb-[100px] flex w-full justify-end gap-4 bg-black bg-opacity-60 px-bodyPadding py-3 transition-all data-[show=true]:mb-0"
        data-show={page.overlay === "show"}
      >
        <MediaChapterPageOverlayScrollButton />
        <ReaderSidebarOpenButton />
      </div>
    </>
  );
};
