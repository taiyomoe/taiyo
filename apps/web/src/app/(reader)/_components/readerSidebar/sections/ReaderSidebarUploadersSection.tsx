"use client"
import { ChapterScansList } from "~/components/ui/chapter-scans-list"
import { ChapterUploader } from "~/components/ui/chapters/chapter-uploader"
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
        <ChapterUploader chapter={chapter} />
        <ChapterScansList
          scans={chapter?.scans}
          orientation="vertical"
          size="md"
        />
      </div>
    </div>
  )
}
