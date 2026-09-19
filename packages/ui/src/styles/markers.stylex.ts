import * as stylex from "@stylexjs/stylex"

/**
 * Contextual-style markers.
 *
 * `stylex.when.ancestor(selector, marker)` lets a descendant react to an
 * ancestor's state. The marker has to be spread onto the ancestor with
 * `stylex.props()`.
 *
 * They live here, and not next to the components that use them, because the
 * compiler hashes a marker from its file name plus export name and only does
 * so for `*.stylex.ts` files: a `defineMarker()` in a component file fails to
 * build with "Unable to generate hash for defineMarker()".
 */

/** Accordion trigger, so the chevron can rotate when the panel opens. */
export const accordionTriggerMarker: ReturnType<typeof stylex.defineMarker> = stylex.defineMarker()

/** Collapsible trigger, so a chevron inside it can turn when the panel opens. */
export const collapsibleTriggerMarker: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker()

/** Calendar day cell, which carries `data-selected` / `data-disabled`. */
export const calendarDayMarker: ReturnType<typeof stylex.defineMarker> = stylex.defineMarker()

/** Combobox popup, so items can widen to the anchor when opened over it. */
export const comboboxPopupMarker: ReturnType<typeof stylex.defineMarker> = stylex.defineMarker()

/** Select popup, same role as the combobox one. */
export const selectPopupMarker: ReturnType<typeof stylex.defineMarker> = stylex.defineMarker()

/** Menu popup, same role again. */
export const menuPopupMarker: ReturnType<typeof stylex.defineMarker> = stylex.defineMarker()

/** Switch-style menu checkbox item, so its thumb sees :active / [data-checked]. */
export const menuSwitchItemMarker: ReturnType<typeof stylex.defineMarker> = stylex.defineMarker()

/** Switch-style drawer menu checkbox item, same role. */
export const drawerSwitchItemMarker: ReturnType<typeof stylex.defineMarker> = stylex.defineMarker()

/** Switch root, so the thumb can squish while the track is pressed. */
export const switchRootMarker: ReturnType<typeof stylex.defineMarker> = stylex.defineMarker()
