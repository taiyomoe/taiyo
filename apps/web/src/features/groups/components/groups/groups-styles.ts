import * as stylex from "@stylexjs/stylex"

export const groupsStyles = stylex.create({
  grid: {
    gap: "0.75rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))",
  },
})
