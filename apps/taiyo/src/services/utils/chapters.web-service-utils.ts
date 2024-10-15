import type { Languages } from "@taiyomoe/db"
import { BaseChaptersServiceUtils } from "@taiyomoe/services"
import type { LatestRelease, RawLatestRelease } from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"

const formatRawLatestReleases = (
  input: RawLatestRelease[],
  preferredTitles?: Languages | null,
): LatestRelease[] =>
  input.map(({ media, ...r }) => ({
    ...r,
    media: {
      id: media.id,
      coverId: media.covers.at(0)!.id,
      mainTitle: MediaUtils.getDisplayTitle(media.titles, preferredTitles),
    },
  }))

export const ChaptersServiceUtils = {
  ...BaseChaptersServiceUtils,
  formatRawLatestReleases,
}
