import type { MediaWithRelations } from "@taiyomoe/types"

type Props = {
  media: MediaWithRelations
}

export const UpdateMediaBannersTab = ({ media }: Props) => {
  return <div>{JSON.stringify(media.banners)}</div>
}
