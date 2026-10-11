import * as stylex from "@stylexjs/stylex"

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
