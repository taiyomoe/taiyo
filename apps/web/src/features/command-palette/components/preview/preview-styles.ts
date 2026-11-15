import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"

export const previewStyles = stylex.create({
  root: {
    padding: "1rem",
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  header: {
    gap: "0.875rem",
    alignItems: "flex-start",
    display: "flex",
    minWidth: 0,
  },
  headerText: {
    flex: "1",
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  heading: {
    color: colors.foreground,
    fontSize: "1rem",
    fontWeight: 600,
    lineHeight: 1.3,
    overflowWrap: "anywhere",
  },
  subtle: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    lineHeight: 1.45,
    overflowWrap: "anywhere",
  },
  section: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    color: colors.mutedForeground,
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  body: {
    color: `color-mix(in srgb, ${colors.foreground} 86%, transparent)`,
    fontSize: "0.8125rem",
    lineHeight: 1.55,
    overflowWrap: "anywhere",
  },
  chips: {
    gap: "0.375rem",
    display: "flex",
    flexWrap: "wrap",
  },
  facts: {
    margin: 0,
    columnGap: "0.75rem",
    display: "grid",
    fontSize: "0.8125rem",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    lineHeight: 1.45,
    rowGap: "0.375rem",
  },
  factLabel: {
    color: colors.mutedForeground,
  },
  factValue: {
    margin: 0,
    color: colors.foreground,
    overflowWrap: "anywhere",
  },
  line: {
    height: "0.75rem",
    width: "100%",
  },
  lineShort: {
    width: "60%",
  },
})
