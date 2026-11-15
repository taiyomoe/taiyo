import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { range } from "remeda"
import { ListCard, ListRow } from "@/components/layout/dashboard-page"

const styles = stylex.create({
  person: {
    borderRadius: "50%",
    flexShrink: 0,
    height: "2.25rem",
    width: "2.25rem",
  },
  group: {
    borderRadius: radius.lg,
    flexShrink: 0,
    height: "2.5rem",
    width: "2.5rem",
  },
  cover: {
    borderRadius: radius.md,
    aspectRatio: "2 / 3",
    flexShrink: 0,
    width: "3rem",
  },
  main: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  title: {
    height: "1rem",
    maxWidth: "16rem",
    width: "45%",
  },
  meta: {
    height: "0.75rem",
    maxWidth: "24rem",
    width: "70%",
  },
  actions: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
  },
  action: {
    borderRadius: "999px",
    height: { default: "2.25rem", [breakpoints.sm]: "2rem" },
  },
})

export function ListCardSkeleton({
  rows = 5,
  media,
  actions = [],
}: {
  rows?: number
  media?: "person" | "group" | "cover"
  actions?: string[]
}) {
  return (
    <div aria-hidden>
      <ListCard>
        {range(0, rows).map((row) => (
          <ListRow key={row}>
            {media === undefined ? null : <Skeleton sx={styles[media]} />}
            <div sx={styles.main}>
              <Skeleton sx={styles.title} />
              <Skeleton sx={styles.meta} />
            </div>
            {actions.length === 0 ? null : (
              <div sx={styles.actions}>
                {range(0, actions.length).map((slot) => (
                  <Skeleton key={slot} style={{ width: actions[slot] }} sx={styles.action} />
                ))}
              </div>
            )}
          </ListRow>
        ))}
      </ListCard>
    </div>
  )
}
