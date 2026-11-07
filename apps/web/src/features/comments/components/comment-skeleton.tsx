import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { range } from "remeda"
import { commentStyles } from "@/features/comments/components/comment-styles"

const styles = stylex.create({
  list: {
    display: "flex",
    flexDirection: "column",
  },
  avatar: {
    borderRadius: radius.full,
  },
  name: {
    height: "0.875rem",
    width: "8rem",
  },
  line: {
    height: "0.875rem",
    width: "min(26rem, 85%)",
  },
  short: {
    height: "0.875rem",
    width: "min(14rem, 55%)",
  },
})

export function CommentSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div aria-hidden sx={styles.list}>
      {range(0, count).map((index) => (
        <div key={index} sx={commentStyles.item}>
          <Skeleton sx={[commentStyles.avatar, styles.avatar]} />
          <div sx={commentStyles.body}>
            <Skeleton sx={styles.name} />
            <Skeleton sx={styles.line} />
            <Skeleton sx={styles.short} />
          </div>
        </div>
      ))}
    </div>
  )
}
