import * as stylex from "@stylexjs/stylex"
import { Minus, Plus } from "@taiyomoe/ui/components/icons"
import { colors, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import type { SearchTag, TagState } from "@/features/advanced-search/lib/search-tags"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  toggle: {
    margin: 0,
    borderColor: {
      default: colors.border,
      ":hover": `color-mix(in srgb, ${colors.foreground} 22%, transparent)`,
    },
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.25rem",
    paddingBlock: "0.25rem",
    paddingInline: "0.75rem",
    alignItems: "center",
    backgroundColor: colors.chip,
    boxShadow: shadows.chip,
    color: colors.foreground,
    cursor: "pointer",
    display: "inline-flex",
    fontFamily: "inherit",
    fontSize: "0.8125rem",
    fontWeight: 500,
    lineHeight: "1.125rem",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    transitionDuration: "150ms",
    transitionProperty: "border-color, background-color, color",
    transitionTimingFunction: motion.easeOut,
    userSelect: "none",
    whiteSpace: "nowrap",
  },
  marked: {
    paddingInlineStart: "0.5rem",
  },
  include: {
    borderColor: colors.success,
    backgroundColor: `color-mix(in srgb, ${colors.success} 12%, ${colors.chip})`,
    color: `color-mix(in srgb, ${colors.success} 70%, ${colors.foreground})`,
  },
  exclude: {
    borderColor: colors.destructive,
    borderStyle: "dashed",
    backgroundColor: `color-mix(in srgb, ${colors.destructive} 10%, ${colors.chip})`,
    color: `color-mix(in srgb, ${colors.destructive} 70%, ${colors.foreground})`,
  },
  glyph: {
    flexShrink: 0,
  },
})
const STATE_LABELS = {
  include: m.search_tag_state_included,
  exclude: m.search_tag_state_excluded,
}

export function TagToggle({
  tag,
  state,
  onToggle,
}: {
  tag: SearchTag
  state: TagState | undefined
  onToggle: () => void
}) {
  return (
    <button
      aria-label={state === undefined ? tag.name : `${tag.name}, ${STATE_LABELS[state]()}`}
      aria-pressed={state !== undefined}
      onClick={onToggle}
      sx={[
        styles.toggle,
        state !== undefined && styles.marked,
        state === "include" && styles.include,
        state === "exclude" && styles.exclude,
      ]}
      type="button"
    >
      {state === "include" ? <Plus size={12} {...stylex.props(styles.glyph)} /> : null}
      {state === "exclude" ? <Minus size={12} {...stylex.props(styles.glyph)} /> : null}
      {tag.name}
    </button>
  )
}
