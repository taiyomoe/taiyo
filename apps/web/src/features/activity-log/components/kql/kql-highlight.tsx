import type { KqlSyntaxError } from "@taiyomoe/audit/query"
import * as stylex from "@stylexjs/stylex"
import { tokenizeKql } from "@taiyomoe/audit/query"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMemo } from "react"
import { kqlStyles } from "@/features/activity-log/components/kql/kql-styles"
import { getKqlRoles, type KqlRole } from "@/features/activity-log/lib/kql-suggestions"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  highlight: {
    color: colors.foreground,
    pointerEvents: "none",
    minHeight: "2.625rem",
  },
  placeholder: {
    color: `color-mix(in srgb, ${colors.mutedForeground} 72%, transparent)`,
  },
  field_: { color: colors.info },
  operator: { color: colors.mutedForeground },
  value: { color: colors.foreground },
  string: { color: colors.success },
  keyword: { color: colors.chart3, fontWeight: 600 },
  paren: { color: colors.mutedForeground },
  wildcard: { color: colors.warning },
  free: { color: colors.foreground },
  invalid: {
    textDecorationColor: colors.destructive,
    textDecorationLine: "underline",
    textDecorationStyle: "wavy",
    textUnderlineOffset: "0.25rem",
  },
})
const ROLE_STYLES: Record<KqlRole, stylex.StyleXStyles | null> = {
  field: styles.field_,
  operator: styles.operator,
  value: styles.value,
  string: styles.string,
  keyword: styles.keyword,
  paren: styles.paren,
  wildcard: styles.wildcard,
  text: styles.free,
  space: null,
}

export function KqlHighlight({ value, error }: { value: string; error: KqlSyntaxError | null }) {
  const tokens = useMemo(() => tokenizeKql(value), [value])
  const roles = useMemo(() => getKqlRoles(tokens), [tokens])

  return (
    <div aria-hidden sx={[kqlStyles.text, styles.highlight]}>
      {value === "" ? <span sx={styles.placeholder}>{m.activity_query_placeholder()}</span> : null}
      {tokens.map((token, index) => {
        const role = roles[index] ?? "space"
        const invalid = error !== null && token.start < error.end && token.end > error.start
        const roleStyle = ROLE_STYLES[role]

        return (
          <span key={`${token.start}-${token.text}`} sx={[roleStyle, invalid && styles.invalid]}>
            {token.text}
          </span>
        )
      })}
      {"​"}
    </div>
  )
}
