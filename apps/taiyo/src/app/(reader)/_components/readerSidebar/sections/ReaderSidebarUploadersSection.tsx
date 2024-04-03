"use client"

import { MediaChapterScans } from "~/components/ui/MediaChapterScans"
import { MediaChapterUploader } from "~/components/ui/MediaChapterUploader"
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
        <MediaChapterScans
          scans={chapter?.scans}
          orientation="vertical"
          size="md"
        />
      </div>
    </div>
  )
}
