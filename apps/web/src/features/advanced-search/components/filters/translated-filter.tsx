import * as stylex from "@stylexjs/stylex"
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@taiyomoe/db/constants"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import { colors, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMemo } from "react"
import { LanguageFlag } from "@/components/flags/flags"
import { getLanguageName } from "@/components/flags/language-flags"
import { ComboFilter } from "@/features/advanced-search/components/filters/combo-filter"
import { FilterSummary } from "@/features/advanced-search/components/filters/filter-summary"
import { m } from "@/paraglide/messages"

type LanguageOption = { code: SupportedLanguage; name: string }

const styles = stylex.create({
  toggle: {
    gap: "0.5rem",
    alignItems: "center",
    color: {
      default: colors.mutedForeground,
      ":hover": colors.foreground,
    },
    cursor: "pointer",
    display: "flex",
    transitionDuration: "150ms",
    transitionProperty: "color",
    transitionTimingFunction: motion.easeOut,
  },
  option: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  optionLabel: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
})

export function TranslatedFilter({
  translated,
  languages,
  onChange,
}: {
  translated: boolean
  languages: readonly SupportedLanguage[]
  onChange: (value: { translated: boolean; languages: SupportedLanguage[] }) => void
}) {
  const options = useMemo(
    () =>
      SUPPORTED_LANGUAGES.map((code) => ({ code, name: getLanguageName(code) })).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [],
  )
  const enabled = translated || languages.length > 0
  const selected = languages.flatMap((code) => options.filter((option) => option.code === code))

  return (
    <ComboFilter<LanguageOption>
      disabled={!enabled}
      empty={m.search_languages_none()}
      getKey={(option) => option.code}
      getLabel={(option) => option.name}
      items={options}
      label={
        <label sx={styles.toggle}>
          <Checkbox
            checked={enabled}
            onCheckedChange={(checked) => {
              onChange({ translated: checked, languages: [] })
            }}
          />
          {m.search_filter_translated()}
        </label>
      }
      onValueChange={(next) => {
        onChange({ translated: true, languages: next.map((option) => option.code) })
      }}
      renderItem={(option) => (
        <span sx={styles.option}>
          <LanguageFlag language={option.code} />
          <span sx={styles.optionLabel}>{option.name}</span>
        </span>
      )}
      searchPlaceholder={m.search_languages_placeholder()}
      summary={
        <FilterSummary
          empty={m.search_filter_any_language()}
          labels={selected.map((option) => option.name)}
        />
      }
      value={selected}
    />
  )
}
