import type { FeaturedMedia } from "@taiyomoe/types"
import { SwipeableFeaturedMedias } from "./swipers/SwipeableFeaturedMedias"

type Props = {
  featuredMedias: FeaturedMedia[]
}

export const FeaturedMedias = ({ featuredMedias }: Props) => (
  <SwipeableFeaturedMedias medias={featuredMedias} />
)
