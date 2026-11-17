import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { ReactElement, ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { createElement } from "react"

const styles = stylex.create({
  pill: {
    gap: "0.375rem",
    paddingInline: null,
    fontSize: "0.8125rem",
    fontWeight: 600,
    lineHeight: 1,
    paddingInlineEnd: "0.6875rem",
    paddingInlineStart: "0.6875rem",
    height: "1.5rem",
    maxWidth: "100%",
    minWidth: 0,
  },
  withIcon: {
    paddingInlineStart: "0.5625rem",
  },
  small: {
    gap: "0.3125rem",
    fontSize: "0.75rem",
    paddingInlineEnd: "0.5rem",
    paddingInlineStart: "0.5rem",
    height: "1.25rem",
  },
  smallWithIcon: {
    paddingInlineStart: "0.4375rem",
  },
  icon: {
    flexShrink: 0,
    height: "0.9375rem",
    width: "0.9375rem",
  },
  smallIcon: {
    height: "0.8125rem",
    width: "0.8125rem",
  },
  // A line box taller than the text, so the clip keeps the accents of capitals (É).
  label: {
    overflow: "hidden",
    lineHeight: 1.4,
    textOverflow: "ellipsis",
  },
})

/**
 * The badge of the site: one height, an icon with room around it, a label that
 * truncates. Rows that show several badges use it for all of them, so they line up.
 */
export function Pill({
  icon,
  size = "default",
  variant = "outline",
  tone,
  iconSx,
  title,
  children,
}: {
  icon?: ((props: IconProps) => ReactElement) | undefined
  /** `sm` sits in compact cards, next to small title badges. */
  size?: "default" | "sm" | undefined
  variant?: BadgeVariant
  /** Colors the pill, over its variant. */
  tone?: Sx
  iconSx?: Sx
  title?: string | undefined
  children: ReactNode
}) {
  return (
    <Badge
      sx={[
        styles.pill,
        icon !== undefined && styles.withIcon,
        size === "sm" && styles.small,
        size === "sm" && icon !== undefined && styles.smallWithIcon,
        tone,
      ]}
      title={title}
      variant={variant}
    >
      {icon === undefined
        ? null
        : createElement(icon, {
            "aria-hidden": true,
            ...stylex.props(styles.icon, size === "sm" && styles.smallIcon, iconSx),
          })}
      <span sx={styles.label}>{children}</span>
    </Badge>
  )
}
