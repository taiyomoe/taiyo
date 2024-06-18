import { ChaptersService } from "@taiyomoe/services"
import { ChapterUploadersChart } from "./_components/ChapterUploadersChart"
import { UploadedChaptersChart } from "./_components/UploadedChaptersChart"

export default async function Page() {
  const stats = await ChaptersService.getUploaderStats()

  return (
    <div className="space-y-10">
      <UploadedChaptersChart data={stats} />
      <ChapterUploadersChart data={stats} />
    </div>
  )
}
