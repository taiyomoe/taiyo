import { SwipeableFeaturedMedias } from "~/app/(root)/_components/swipers/SwipeableFeaturedMedias"
import type { FeaturedMedia } from "~/lib/types"

type Props = {
  featuredMedias: FeaturedMedia[]
}

export const FeaturedMedias = ({ featuredMedias }: Props) => (
  <SwipeableFeaturedMedias medias={featuredMedias} />
)
