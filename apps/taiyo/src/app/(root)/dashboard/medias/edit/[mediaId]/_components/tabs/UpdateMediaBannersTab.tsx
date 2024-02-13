import type { MediaWithRelations } from "~/lib/types"

type Props = {
  media: MediaWithRelations
}

export const UpdateMediaBannersTab = ({ media }: Props) => {
  return <div>{JSON.stringify(media.banners)}</div>
}
