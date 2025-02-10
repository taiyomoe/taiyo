import { Spinner } from "@nextui-org/spinner"
import type { LatestReleaseGrouped } from "@taiyomoe/types"
import { useSetAtom } from "jotai"
import {
  userProfileAdditionalChapters,
  userProfileExpandedMedias,
} from "~/atoms/userProfile.atoms"
import { UnderlineButton } from "~/components/generics/buttons/underline-button"
import { api } from "~/trpc/react"

type Props = {
  media: LatestReleaseGrouped
  userId: string
}

export const UserUploadsSeeMoreButton = ({ media, userId }: Props) => {
  const setAdditionalChapters = useSetAtom(userProfileAdditionalChapters)
  const setExpandedMedias = useSetAtom(userProfileExpandedMedias)
  const { isLoading, isSuccess, refetch } = api.chapters.getByUserId.useQuery(
    { userId, mediaId: media.id },
    { enabled: false },
  )

  const handlePress = async () => {
    const { data: newData } = await refetch()

    if (!newData) {
      return
    }

    setAdditionalChapters((prev) => ({
      ...prev,
      [media.id]: newData,
    }))
    setExpandedMedias((prev) => prev.concat(media.id))
  }

  if (!media.hasMoreChapters || isSuccess) return null

  if (isLoading) {
    return <Spinner size="sm" />
  }

  return (
    <UnderlineButton
      className="w-fit self-center text-center"
      onPress={handlePress}
      color="primary"
    >
      Ver mais
    </UnderlineButton>
  )
}
