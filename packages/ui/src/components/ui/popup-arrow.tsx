import type React from "react"
import * as stylex from "@stylexjs/stylex"
import { colors } from "../../styles/tokens.stylex"

const OUTLINE =
  "M0 9.5C2.6 9.5 4.81 8.56 5.6 7.4L8.8 2.7Q10 0.94 11.2 2.7L14.4 7.4C15.19 8.56 17.4 9.5 20 9.5"

export const popupArrowOffset = 8

export const withArrowOffset = <T,>(sideOffset: T | number, arrow: boolean): T | number =>
  arrow && typeof sideOffset === "number" ? sideOffset + popupArrowOffset : sideOffset

export const popupArrowStyles = stylex.create({
  arrow: {
    display: "flex",
    rotate: {
      '[data-side="left"]': "90deg",
      '[data-side="right"]': "-90deg",
      '[data-side="top"]': "180deg",
      default: null,
    },
    bottom: { '[data-side="top"]': "-10px", default: null },
    height: "10px",
    left: { '[data-side="right"]': "-15px", default: null },
    right: { '[data-side="left"]': "-15px", default: null },
    top: { '[data-side="bottom"]': "-10px", default: null },
    width: "20px",
  },
  svg: {
    overflow: "visible",
  },
  fill: {
    fill: colors.popover,
  },
  backing: {
    fill: "none",
    stroke: colors.popover,
    strokeWidth: 1,
  },
  stroke: {
    fill: "none",
    stroke: colors.border,
    strokeWidth: 1,
  },
})

export function PopupArrowSvg(): React.ReactElement {
  return (
    <svg
      aria-hidden="true"
      height="10"
      viewBox="0 0 20 10"
      width="20"
      {...stylex.props(popupArrowStyles.svg)}
    >
      <path d={`${OUTLINE}V10H0Z`} {...stylex.props(popupArrowStyles.fill)} />
      <path d="M0 9H20V10H0Z" {...stylex.props(popupArrowStyles.fill)} />
      <path d={OUTLINE} {...stylex.props(popupArrowStyles.backing)} />
      <path d={OUTLINE} {...stylex.props(popupArrowStyles.stroke)} />
    </svg>
  )
}
