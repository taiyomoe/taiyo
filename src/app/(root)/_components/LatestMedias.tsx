import type { LatestMedia } from "~/lib/types"

import { SwipeableLatestMedias } from "./swiper/SwipeableLatestMedias"

type Props = {
  latestMedias: LatestMedia[]
}

export const LatestMedias = ({ latestMedias }: Props) => (
  <div className="flex w-full flex-col gap-6">
    <p className="text-2xl font-medium">Últimas obras adicionadas</p>
    <SwipeableLatestMedias medias={latestMedias} />
  </div>
)
