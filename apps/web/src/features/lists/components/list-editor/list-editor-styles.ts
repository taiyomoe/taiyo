import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"

const PADDING = "1.25rem"

export const listEditorStyles = stylex.create({
  panel: {
    padding: PADDING,
    borderColor: colors.border,
    borderRadius: `calc(${radius.sm} + ${PADDING} + 1px)`,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "1.25rem",
    backgroundColor: colors.card,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  panelHeader: {
    gap: "1rem",
    alignItems: "baseline",
    display: "flex",
    justifyContent: "space-between",
  },
  panelTitle: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 650,
  },
})
