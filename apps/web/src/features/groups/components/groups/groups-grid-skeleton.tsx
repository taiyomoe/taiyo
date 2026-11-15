import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { range } from "remeda"
import { groupsStyles } from "@/features/groups/components/groups/groups-styles"

const styles = stylex.create({
  skeleton: {
    borderRadius: radius.xl,
    height: "4.25rem",
  },
})

export function GroupsGridSkeleton() {
  return (
    <div sx={groupsStyles.grid}>
      {range(0, 12).map((index) => (
        <Skeleton key={index} sx={styles.skeleton} />
      ))}
    </div>
  )
}
