// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { range } from "remeda"
import { groupStyles } from "@/features/groups/components/group/group-styles"

export function GroupChaptersSkeleton() {
  return (
    <div sx={groupStyles.column}>
      {range(0, 5).map((index) => (
        <Skeleton key={index} sx={groupStyles.skeleton} />
      ))}
    </div>
  )
}
