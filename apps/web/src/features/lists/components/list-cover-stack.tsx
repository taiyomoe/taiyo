import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { Cover } from "@/features/media/components/cover"

const STACK_SIZE = 4
const styles = stylex.create({
  stack: {
    alignItems: "flex-end",
    display: "flex",
    flexShrink: 0,
    isolation: "isolate",
  },
  cover: {
    boxShadow: `0 0 0 2px ${colors.card}, ${shadows.raised}`,
  },
  sm: {
    borderRadius: radius.sm,
    marginInlineStart: { default: "-1.75rem", ":first-child": 0 },
    width: "2.75rem",
  },
  md: {
    borderRadius: radius.md,
    marginInlineStart: { default: "-2.75rem", ":first-child": 0 },
    width: "4.25rem",
  },
  lg: {
    borderRadius: radius.lg,
    marginInlineStart: { default: "-4.25rem", ":first-child": 0 },
    width: "6.5rem",
  },
  layer: (index: number) => ({
    transform: `scale(${1 - index * 0.08})`,
    transformOrigin: "bottom right",
    zIndex: STACK_SIZE - index,
  }),
})
const SIZE_STYLE = { sm: styles.sm, md: styles.md, lg: styles.lg } as const

export function ListCoverStack({
  coverUrls,
  size = "md",
  sx,
}: {
  coverUrls: readonly string[]
  size?: "sm" | "md" | "lg"
  sx?: Sx
}) {
  const covers = coverUrls.length === 0 ? [null] : coverUrls.slice(0, STACK_SIZE)

  return (
    <span aria-hidden sx={[styles.stack, sx]}>
      {covers.map((url, index) => (
        <Cover
          key={url ?? "placeholder"}
          src={url}
          sx={[styles.cover, SIZE_STYLE[size], styles.layer(index)]}
        />
      ))}
    </span>
  )
}
