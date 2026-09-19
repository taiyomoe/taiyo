"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/utils/cn"
import { colors, consts, shadows } from "../../styles/tokens.stylex"
import type { Sx } from "../../styles/sx"

const styles = stylex.create({
  base: {
    borderColor: {
      "[aria-invalid]": {
        default: `color-mix(in srgb, ${colors.destructive} 36%, transparent)`,
        ":focus-visible": `color-mix(in srgb, ${colors.destructive} 64%, transparent)`,
      },
      default: colors.input,
    },
    borderRadius: "0.25rem",
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "center",
    backgroundClip: "padding-box",
    // The input-surface token: a checkbox is a field, and once checked the
    // indicator covers the root entirely, so only the unchecked fill shows.
    backgroundColor: colors.field,
    boxShadow: {
      "[aria-invalid]": "none",
      "[data-checked]": "none",
      "[data-disabled]": "none",
      default: "0 1px 2px 0 rgb(0 0 0 / 5%)",
    },
    cursor: {
      "[data-disabled]": "not-allowed",
      default: null,
    },
    display: "inline-flex",
    flexShrink: 0,
    justifyContent: "center",
    opacity: {
      "[data-disabled]": 0.64,
      default: 1,
    },
    outlineColor: {
      "[aria-invalid]": `color-mix(in srgb, ${colors.destructive} 48%, transparent)`,
      default: colors.ring,
    },
    outlineOffset: 1,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
    position: "relative",
    transitionDuration: "150ms",
    transitionProperty: "box-shadow",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    height: {
      default: "1.125rem",
      [consts.sm]: "1rem",
    },
    width: {
      default: "1.125rem",
      [consts.sm]: "1rem",
    },
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: {
        "[aria-invalid]": "none",
        "[data-checked]": "none",
        "[data-disabled]": "none",
        default: shadows.edge,
      },
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
  indicator: {
    inset: -1,
    borderRadius: "0.25rem",
    alignItems: "center",
    backgroundColor: {
      "[data-checked]": colors.primary,
      default: null,
    },
    color: {
      "[data-indeterminate]": colors.foreground,
      default: colors.primaryForeground,
    },
    display: {
      "[data-unchecked]": "none",
      default: "flex",
    },
    justifyContent: "center",
    position: "absolute",
  },
  icon: {
    height: {
      default: "0.875rem",
      [consts.sm]: "0.75rem",
    },
    width: {
      default: "0.875rem",
      [consts.sm]: "0.75rem",
    },
  },
})

/** See the note on SeparatorProps for why `className` sits alongside `sx`. */
export type CheckboxProps = CheckboxPrimitive.Root.Props & {
  sx?: Sx
}

export function Checkbox({ className, sx, ...props }: CheckboxProps): React.ReactElement {
  const styleProps = stylex.props(styles.base, sx)
  const indicatorProps = stylex.props(styles.indicator)

  return (
    <CheckboxPrimitive.Root
      className={cn(styleProps.className, className)}
      data-slot="checkbox"
      style={styleProps.style}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={indicatorProps.className}
        data-slot="checkbox-indicator"
        render={(
          renderProps: React.ComponentProps<"span">,
          state: CheckboxPrimitive.Indicator.State,
        ) => (
          <span {...renderProps}>
            {state.indeterminate ? (
              <svg
                aria-hidden="true"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
                sx={styles.icon}
              >
                <path d="M5.252 12h13.496" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
                sx={styles.icon}
              >
                <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
              </svg>
            )}
          </span>
        )}
        style={indicatorProps.style}
      />
    </CheckboxPrimitive.Root>
  )
}

export { CheckboxPrimitive }
