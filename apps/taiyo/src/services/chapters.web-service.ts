import { cacheClient } from "@taiyomoe/cache"
import { type Languages, db } from "@taiyomoe/db"
import { BaseChaptersService } from "@taiyomoe/services"
import type { RawLatestRelease } from "@taiyomoe/types"
import { ChaptersServiceUtils } from "./utils/chapters.web-service-utils"

const getLatest = async (preferredTitles?: Languages | null) => {
  const cacheController = cacheClient.chapters.latest
  const cached = await cacheController.get()

  if (cached) {
    return ChaptersServiceUtils.formatRawLatestReleases(cached, preferredTitles)
  }

  const result: RawLatestRelease[] = await db.mediaChapter.findMany({
    take: 30,
    where: { deletedAt: null, media: { deletedAt: null } },
    orderBy: { createdAt: "desc" },
    select: ChaptersServiceUtils.latestReleaseQuery,
  })

  void cacheController.set(result)

  return ChaptersServiceUtils.formatRawLatestReleases(result, preferredTitles)
}

export const ChaptersService = {
  ...BaseChaptersService,
  getLatest,
}
