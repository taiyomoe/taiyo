import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints, colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { range } from "remeda"

const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    gap: "1rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  card: {
    padding: "1.5rem",
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "1.25rem",
    backgroundColor: colors.card,
    display: "flex",
    flexDirection: "column",
  },
  top: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
  },
  avatar: {
    borderRadius: radius.lg,
    flexShrink: 0,
    height: "2.5rem",
    width: "2.5rem",
  },
  heading: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
  name: {
    height: "1.25rem",
    width: "min(14rem, 60%)",
  },
  meta: {
    height: "0.875rem",
    width: "min(10rem, 45%)",
  },
  grants: {
    height: "3.5rem",
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    justifyContent: "flex-end",
  },
  button: {
    borderRadius: "999px",
    height: { default: "2.25rem", [breakpoints.sm]: "2rem" },
    width: "5.5rem",
  },
})

export function InvitationsSkeleton() {
  return (
    <ul aria-hidden sx={styles.list}>
      {range(0, 2).map((index) => (
        <li key={index} sx={styles.card}>
          <div sx={styles.top}>
            <Skeleton sx={styles.avatar} />
            <div sx={styles.heading}>
              <Skeleton sx={styles.name} />
              <Skeleton sx={styles.meta} />
            </div>
          </div>
          <Skeleton sx={styles.grants} />
          <div sx={styles.actions}>
            <Skeleton sx={styles.button} />
            <Skeleton sx={styles.button} />
          </div>
        </li>
      ))}
    </ul>
  )
}
