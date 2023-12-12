import { SwipeableFeaturedMedias } from "~/app/(root)/_components/swiper/SwipeableFeaturedMedias";
import type { FeaturedMedia } from "~/lib/types";

type Props = {
  featuredMedias: FeaturedMedia[];
};

export const FeaturedMedias = ({ featuredMedias }: Props) => (
  <SwipeableFeaturedMedias medias={featuredMedias} />
);
