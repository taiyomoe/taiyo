import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"

export const fieldEditorStyles = stylex.create({
  stack: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  addRow: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  addPicker: {
    flexGrow: 1,
    maxWidth: "20rem",
    minWidth: "12rem",
  },
  option: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
    width: "100%",
  },
  muted: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
})
