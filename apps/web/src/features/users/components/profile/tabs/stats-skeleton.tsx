// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { range } from "remeda"
import { statsStyles } from "@/features/users/components/profile/tabs/stats-styles"

export function StatsTabSkeleton() {
  return (
    <div aria-hidden sx={statsStyles.root}>
      <div sx={statsStyles.tiles}>
        {range(0, 4).map((index) => (
          <Skeleton key={index} sx={statsStyles.skeletonTile} />
        ))}
      </div>
      <Skeleton sx={statsStyles.skeletonCard} />
      <div sx={statsStyles.grid}>
        {range(0, 3).map((index) => (
          <Skeleton key={index} sx={statsStyles.skeletonCard} />
        ))}
      </div>
    </div>
  )
}
