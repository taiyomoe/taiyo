import * as stylex from "@stylexjs/stylex"

/**
 * Contextual-style markers for `stylex.when.ancestor(selector, marker)`, spread
 * onto the ancestor with `stylex.props()`.
 *
 * They live here rather than beside their components because the compiler
 * hashes a marker from its file name plus export name, and only does so for
 * `*.stylex.ts` files: a `defineMarker()` in a component file fails to build
 * with "Unable to generate hash for defineMarker()".
 */
type Marker = ReturnType<typeof stylex.defineMarker>

export const accordionTriggerMarker: Marker = stylex.defineMarker()

export const collapsibleTriggerMarker: Marker = stylex.defineMarker()

export const calendarDayMarker: Marker = stylex.defineMarker()

export const comboboxPopupMarker: Marker = stylex.defineMarker()

export const selectPopupMarker: Marker = stylex.defineMarker()

export const menuPopupMarker: Marker = stylex.defineMarker()

export const menuSwitchItemMarker: Marker = stylex.defineMarker()

export const drawerSwitchItemMarker: Marker = stylex.defineMarker()

export const switchRootMarker: Marker = stylex.defineMarker()
