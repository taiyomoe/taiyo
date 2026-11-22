import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"

const CHAPTER_NUMBER_COLOR = `color-mix(in srgb, ${colors.primary} 78%, ${colors.foreground})`
const MODERATION_COLORS = { text: colors.destructiveForeground, tint: colors.destructive }

/** Text on the theme's background, then the tint behind icons. */
export const KIND_COLORS = {
  CHAPTER_PUBLISHED: { text: CHAPTER_NUMBER_COLOR, tint: colors.primary },
  COMMENT_REPLY: { text: colors.infoForeground, tint: colors.info },
  COMMENT_LIKE: { text: colors.warningForeground, tint: colors.warning },
  FOLLOW: { text: colors.successForeground, tint: colors.success },
  RANKING_REWARD: { text: colors.warningForeground, tint: colors.chart5 },
  ACHIEVEMENT_EARNED: {
    text: `color-mix(in srgb, ${colors.chart3} 72%, ${colors.foreground})`,
    tint: colors.chart3,
  },
  LIST_MODERATED: MODERATION_COLORS,
  PROFILE_MODERATED: MODERATION_COLORS,
  REPORT_REVIEWED: MODERATION_COLORS,
} as const

export const notificationRowStyles = stylex.create({
  row: {
    gap: "0.875rem",
    paddingBlock: "0.875rem",
    paddingInline: "1rem",
    alignItems: "flex-start",
    backgroundColor: {
      default: "transparent",
      ":has([data-primary]:hover)": `color-mix(in srgb, ${colors.foreground} 3%, transparent)`,
    },
    display: "flex",
    outlineColor: colors.ring,
    outlineOffset: -2,
    outlineStyle: { default: "none", ":has([data-primary]:focus-visible)": "solid" },
    outlineWidth: 2,
    position: "relative",
    transitionDuration: "150ms",
    transitionProperty: "background-color",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
  rowPage: {
    gap: { default: "0.75rem", [breakpoints.sm]: "1rem" },
    paddingBlock: "1rem",
    paddingInline: { default: "0.875rem", [breakpoints.sm]: "1.125rem" },
    display: "grid",
    gridTemplateColumns: {
      default: "auto auto minmax(0, 1fr)",
      [breakpoints.sm]: "auto auto minmax(0, 1fr) auto",
    },
  },
  unread: {
    backgroundColor: {
      default: `color-mix(in srgb, ${colors.primary} 7%, transparent)`,
      ":has([data-primary]:hover)": `color-mix(in srgb, ${colors.primary} 11%, transparent)`,
    },
  },
  selected: {
    backgroundColor: `color-mix(in srgb, ${colors.primary} 13%, transparent)`,
  },
  above: {
    position: "relative",
    zIndex: 1,
  },
  checkbox: {
    position: "relative",
    zIndex: 1,
    marginTop: "0.125rem",
  },
  cover: {
    borderRadius: radius.md,
    backgroundColor: colors.muted,
    boxShadow: `0 1px 2px rgb(0 0 0 / 24%)`,
    flexShrink: 0,
    objectFit: "cover",
    height: "4.125rem",
    width: "2.75rem",
  },
  coverPage: {
    height: { default: "4.125rem", [breakpoints.sm]: "4.5rem" },
    width: { default: "2.75rem", [breakpoints.sm]: "3rem" },
  },
  avatar: {
    flexShrink: 0,
    height: "1.875rem",
    width: "1.875rem",
  },
  avatarPage: {
    height: "2.75rem",
    width: "2.75rem",
  },
  iconCircle: {
    borderRadius: radius.full,
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
    height: "2rem",
    width: "2rem",
  },
  iconCirclePage: {
    height: "2.75rem",
    width: "2.75rem",
  },
  body: {
    flex: "1",
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  label: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.75rem",
    fontWeight: 600,
    lineHeight: 1.2,
    minWidth: 0,
  },
  labelTime: {
    display: { default: "inline", [breakpoints.sm]: "none" },
    marginLeft: "auto",
  },
  titleLine: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  title: {
    overflow: "hidden",
    textDecoration: "none",
    color: colors.foreground,
    fontSize: "0.9375rem",
    fontWeight: 650,
    lineHeight: 1.3,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  titlePage: {
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    display: "-webkit-box",
    fontSize: "1rem",
    overflowWrap: "anywhere",
    whiteSpace: "normal",
  },
  primary: {
    outlineStyle: "none",
    "::after": {
      inset: 0,
      content: '""',
      position: "absolute",
    },
  },
  primaryButton: {
    font: "inherit",
    padding: 0,
    borderStyle: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    textAlign: "start",
  },
  readButton: {
    alignSelf: "center",
  },
  chapterLine: {
    gap: "0.5rem",
    alignItems: "baseline",
    display: "flex",
    fontSize: "0.875rem",
    lineHeight: 1.35,
    minWidth: 0,
  },
  chapterNumber: {
    color: CHAPTER_NUMBER_COLOR,
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.875rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  chapterTitle: {
    overflow: "hidden",
    color: colors.mutedForeground,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  meta: {
    gap: "0.375rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.8125rem",
    lineHeight: 1.35,
    minWidth: 0,
  },
  flag: {
    flexShrink: 0,
  },
  groups: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  separator: {
    flexShrink: 0,
    opacity: 0.6,
  },
  time: {
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.75rem",
  },
  sentence: {
    overflow: "hidden",
    textDecoration: "none",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 3,
    color: colors.mutedForeground,
    display: "-webkit-box",
    fontSize: "0.875rem",
    lineHeight: 1.45,
    overflowWrap: "anywhere",
  },
  quote: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    paddingBlock: "0.5625rem",
    paddingInline: "0.75rem",
    backgroundColor: colors.well,
    color: colors.foreground,
    display: "block",
    fontSize: "0.875rem",
    lineHeight: 1.45,
    marginTop: "0.375rem",
  },
  quoteText: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 3,
    display: "-webkit-box",
    overflowWrap: "anywhere",
    whiteSpace: "pre-line",
  },
  quoteImage: {
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
  actions: {
    gap: "0.125rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    marginLeft: "-0.5rem",
    marginTop: "0.25rem",
  },
  replyAction: {
    color: CHAPTER_NUMBER_COLOR,
  },
  mutedAction: {
    color: colors.mutedForeground,
  },
  votedAction: {
    color: CHAPTER_NUMBER_COLOR,
  },
  actionsTime: {
    marginLeft: "auto",
  },
  composer: {
    position: "relative",
    zIndex: 1,
    marginTop: "0.5rem",
  },
  aside: {
    gap: "0.625rem",
    gridColumn: { default: "3", [breakpoints.sm]: "4" },
    gridRow: { default: "2", [breakpoints.sm]: "1" },
    alignItems: "flex-end",
    display: "flex",
    flexDirection: "column",
  },
  asideTime: {
    display: { default: "none", [breakpoints.sm]: "inline" },
  },
  asideActions: {
    gap: "0.25rem",
    alignItems: "center",
    alignSelf: { default: "stretch", [breakpoints.sm]: "auto" },
    display: "flex",
    flexDirection: { default: "row", [breakpoints.sm]: "column" },
    justifyContent: { default: "flex-start", [breakpoints.sm]: null },
  },
  iconButtons: {
    gap: "0.125rem",
    display: { default: "none", [breakpoints.sm]: "flex" },
  },
  viewThread: {
    display: { default: "none", [breakpoints.sm]: "inline-flex" },
  },
  asideDesktopOnly: {
    display: { default: "none", [breakpoints.sm]: "flex" },
  },
  dot: {
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    flexShrink: 0,
    height: "0.4375rem",
    width: "0.4375rem",
  },
  dotHidden: {
    visibility: "hidden",
  },
  cornerDot: {
    marginTop: "0.4375rem",
  },
  skeletonLine: {
    height: "0.75rem",
    width: "70%",
  },
  skeletonShort: {
    height: "0.75rem",
    width: "40%",
  },
  kind: (color: string) => ({
    color,
  }),
  tint: (tint: string, color: string) => ({
    backgroundColor: `color-mix(in srgb, ${tint} 15%, transparent)`,
    color,
  }),
})
