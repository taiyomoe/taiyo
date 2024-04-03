import type { LatestMedia } from "@taiyomoe/types"
import { SwipeableLatestMedias } from "./swipers/SwipeableLatestMedias"

type Props = {
  latestMedias: LatestMedia[]
}

export const LatestMedias = ({ latestMedias }: Props) => (
  <div className="flex w-full flex-col gap-6">
    <p className="font-medium text-2xl">Últimas obras adicionadas</p>
    <SwipeableLatestMedias medias={latestMedias} />
  </div>
)
