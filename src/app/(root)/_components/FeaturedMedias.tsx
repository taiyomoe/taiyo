import type { FeaturedMedia } from "~/lib/types"

import { SwipeableFeaturedMedias } from "./swipers/SwipeableFeaturedMedias"

type Props = {
  featuredMedias: FeaturedMedia[]
}

export const FeaturedMedias = ({ featuredMedias }: Props) => (
  <SwipeableFeaturedMedias medias={featuredMedias} />
)
