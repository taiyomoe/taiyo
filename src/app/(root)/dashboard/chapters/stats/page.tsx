import { MediaChapterService } from "~/lib/services"

import { UploadedChaptersChart } from "./_components/UploadedChaptersChart"

export default async function Page() {
  const stats = await MediaChapterService.getUploaderStats()

  return <UploadedChaptersChart data={stats} />
}
