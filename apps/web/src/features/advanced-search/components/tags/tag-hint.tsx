import * as stylex from "@stylexjs/stylex"
import { Info } from "@taiyomoe/ui/components/icons"
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useTagHint } from "@/features/advanced-search/hooks/use-tag-hint"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  hint: {
    margin: 0,
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.8125rem",
    fontStyle: "italic",
    lineHeight: "1.25rem",
  },
  icon: {
    flexShrink: 0,
  },
  dismiss: {
    margin: 0,
    padding: 0,
    borderRadius: radius.sm,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: {
      default: colors.mutedForeground,
      ":hover": colors.foreground,
    },
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "inherit",
    fontStyle: "normal",
    fontWeight: 500,
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    textDecorationLine: "underline",
    textUnderlineOffset: "0.2em",
    transitionDuration: "150ms",
    transitionProperty: "color",
    transitionTimingFunction: motion.easeOut,
  },
})

export function TagHint() {
  const { visible, dismiss } = useTagHint()

  if (!visible) {
    return null
  }

  return (
    <p sx={styles.hint}>
      <Info size={14} {...stylex.props(styles.icon)} />
      {m.search_tags_hint()}
      <button onClick={dismiss} sx={styles.dismiss} type="button">
        {m.search_tags_hint_dismiss()}
      </button>
    </p>
  )
}
