"use client"
import { MediaChapterUploader } from "~/components/ui/MediaChapterUploader"
import { ChapterScansList } from "~/components/ui/chapter-scans-list"
import { useReaderStore } from "~/stores"

type Props = {
  className: string
}

export const ReaderSidebarUploadersSection = ({ className }: Props) => {
  const { chapter } = useReaderStore()

  return (
    <div className={className}>
      <p className="font-medium text-md">Upado por</p>
      <div className="flex flex-col gap-2">
        <MediaChapterUploader uploader={chapter?.uploader} size="md" />
        <ChapterScansList
          scans={chapter?.scans}
          orientation="vertical"
          size="md"
        />
      </div>
    </div>
  )
}
