import type { LatestChapter } from "@/features/chapters/api/chapters"

export const targetOf = (
  chapter: Pick<LatestChapter, "uploader" | "groups">,
  status: "PUBLISHED" | "SCHEDULED",
) => ({
  uploaderId: chapter.uploader.id,
  status,
  groupIds: chapter.groups.map((group) => group.id),
})
