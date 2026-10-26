import * as stylex from "@stylexjs/stylex"

export const paginationStyles = stylex.create({
  page: {
    paddingInline: "0.375rem",
    fontVariantNumeric: "tabular-nums",
    height: { default: null, "@media (width < 40rem)": "2rem" },
    minWidth: { default: "2.25rem", "@media (width < 40rem)": "2rem" },
    width: "auto",
  },
})
