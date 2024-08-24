import { Divider } from "@nextui-org/divider"
import type { LatestReleaseGrouped, UserLimited } from "@taiyomoe/types"
import { ChapterUtils, CoverUtils, MediaUtils } from "@taiyomoe/utils"
import { useAtomValue } from "jotai"
import Link from "next/link"
import { useMemo } from "react"
import { MediaChaptersTabRowCard } from "~/app/(root)/media/[mediaId]/_components/tabs/chapters/card/media-chapters-tab-row-card"
import {
  userProfileAdditionalChapters,
  userProfileExpandedMedias,
} from "~/atoms/userProfile.atoms"
import { MediaImage } from "~/components/images/MediaImage"
import { useDevice } from "~/hooks/useDevice"
import { UserUploadsExpandButton } from "./user-uploads-expand-button"
import { UserUploadsSeeMoreButton } from "./user-uploads-see-more-button"

type Props = {
  user: UserLimited
  media: LatestReleaseGrouped
  index: number
}

export const UserUploadsMediaCard = ({ user, media, index }: Props) => {
  const { isAboveMobile } = useDevice()
  const expandedMedias = useAtomValue(userProfileExpandedMedias)
  const additionalChapters = useAtomValue(userProfileAdditionalChapters)[
    media.id
  ]
  const chapters = useMemo(() => {
    const isExpanded = expandedMedias.includes(media.id)

    if (isExpanded && additionalChapters) {
      return media.chapters.concat(additionalChapters)
    }

    return media.chapters
  }, [expandedMedias, media.id, media.chapters, additionalChapters])

  return (
    <div
      key={media.id}
      id={`marquee-card-${index}`}
      className="flex gap-4 rounded-large bg-content2 p-4"
    >
      <Link href={MediaUtils.getUrl(media)} className="hidden md:block">
        <MediaImage
          src={CoverUtils.getUrl(media)}
          classNames={{
            wrapper: "sticky top-[calc(var(--navbar-height)+16px)]",
            height: "min-h-[295px] h-[295px]",
            width: "min-w-[215px] w-[215px]",
          }}
          maxHeight={295}
          maxWidth={215}
          alt="media's cover"
          isZoomed
        />
      </Link>
      <div className="flex w-full flex-col gap-4 md:mt-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={MediaUtils.getUrl(media)}
            className="line-clamp-1 break-all font-medium text-lg hover:underline md:text-xl"
          >
            {media.mainTitle}
          </Link>
          <UserUploadsExpandButton mediaId={media.id} />
        </div>
        <Divider />
        <div>
          {chapters.map((c, i) => (
            <MediaChaptersTabRowCard
              key={c.id}
              chapter={c}
              order={ChapterUtils.computeOrder(i, chapters.length)}
              index={i}
              noisyWidth={isAboveMobile ? 417 : 186}
            />
          ))}
        </div>
        <UserUploadsSeeMoreButton media={media} userId={user.id} />
      </div>
    </div>
  )
}
