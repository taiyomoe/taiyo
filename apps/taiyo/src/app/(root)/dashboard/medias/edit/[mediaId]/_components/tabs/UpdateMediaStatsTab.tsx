import type { MediaWithRelations } from "@taiyomoe/types"

type Props = {
  media: MediaWithRelations
}

export const UpdateMediaStatsTab = ({ media }: Props) => {
  return (
    <div>
      <p>Stats</p>
      {JSON.stringify(media)}
    </div>
  )
}
