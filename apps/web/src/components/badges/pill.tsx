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
    fontSize: "0.75rem",
    fontWeight: 600,
    lineHeight: 1,
    paddingInlineEnd: "0.625rem",
    paddingInlineStart: "0.625rem",
    height: "1.375rem",
    maxWidth: "100%",
    minWidth: 0,
  },
  withIcon: {
    paddingInlineStart: "0.5rem",
  },
  small: {
    gap: "0.25rem",
    fontSize: "0.6875rem",
    paddingInlineEnd: "0.4375rem",
    paddingInlineStart: "0.4375rem",
    height: "1.125rem",
  },
  smallWithIcon: {
    paddingInlineStart: "0.375rem",
  },
  icon: {
    flexShrink: 0,
    height: "0.875rem",
    width: "0.875rem",
  },
  smallIcon: {
    height: "0.75rem",
    width: "0.75rem",
  },
  label: {
    overflow: "hidden",
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
