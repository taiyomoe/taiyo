import * as stylex from "@stylexjs/stylex"

import { colors, consts, shadows } from "./tokens.stylex"

/**
 * The design language's repeated style blocks, in one place.
 *
 * These compose at the `stylex.props()` call site and nowhere else — an
 * imported style is a compiled atom map by the time it reaches you, so
 * spreading one back into `stylex.create()` fails ("Only static values are
 * allowed"). Pass them as leading arguments so a component's own styles, and
 * then `sx`, can still override:
 *
 *     stylex.props(recipe.raisedEdge, styles.popup, sx)
 *
 * When a local style overrides a property a recipe sets conditionally, it must
 * repeat the recipe's `default` branch — a bare `default: null` erases it (see
 * STYLEX.md).
 */

/**
 * The 1px light edge every raised surface draws on its own `::before` layer.
 * `borderRadius: inherit` keeps it concentric with whatever radius the host
 * sets, so the recipe never has to know it.
 */
export const surface = stylex.create({
  raisedEdge: {
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: shadows.edge,
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
})

/**
 * Pads a control out to the 44px minimum touch target on coarse pointers
 * without affecting its drawn size. The host must be `position: relative`.
 */
export const tap = stylex.create({
  target: {
    "::after": {
      content: {
        default: "none",
        [consts.pointerCoarse]: '""',
      },
      position: "absolute",
      height: "100%",
      minHeight: "2.75rem",
      minWidth: "2.75rem",
      width: "100%",
    },
  },
})

/**
 * Focus rings are drawn with `outline`, not a box-shadow ring, so they never
 * compose with the elevation shadows.
 */
export const focus = stylex.create({
  /** Buttons, toggles, tabs — a 2px ring offset clear of the control's edge. */
  control: {
    outlineColor: colors.ring,
    outlineOffset: 1,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
  },
  /** Fields — a wider, softer ring that sits against the border. */
  field: {
    outlineColor: `color-mix(in srgb, ${colors.ring} 24%, transparent)`,
    outlineStyle: {
      default: "none",
      ":focus-within": "solid",
    },
    outlineWidth: 3,
  },
})

export const a11y = stylex.create({
  srOnly: {
    margin: -1,
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    clipPath: "inset(50%)",
    position: "absolute",
    whiteSpace: "nowrap",
    height: "1px",
    width: "1px",
  },
})
