import { SwipeableFeaturedMedias } from "~/app/(root)/_components/swiper/SwipeableFeaturedMedias";
import type { FeaturedMedia } from "~/lib/types";

type Props = {
  featuredMedias: FeaturedMedia[];
};

export const FeaturedMedias = ({ featuredMedias }: Props) => (
  // <Skeleton className="h-[200px] rounded-2xl md:h-[300px] lg:h-[500px]" />
  <SwipeableFeaturedMedias medias={featuredMedias} />
);
