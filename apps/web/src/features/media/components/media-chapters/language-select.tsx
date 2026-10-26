import * as stylex from "@stylexjs/stylex"
import { Languages } from "@taiyomoe/ui/components/icons"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { MediaChapterFacets } from "@/features/chapters/api/chapters"
import { LanguageFlag, getLanguageName } from "@/components/flags/flags"
import { m } from "@/paraglide/messages"

const ALL_LANGUAGES = "all"
const styles = stylex.create({
  trigger: {
    maxWidth: "14rem",
    minWidth: "10rem",
    width: "auto",
  },
  triggerValue: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  triggerText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  triggerIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  item: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    width: "100%",
  },
  itemCount: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    marginInlineStart: "auto",
    paddingInlineStart: "1rem",
  },
})

type LanguageSelectProps = {
  languages: MediaChapterFacets["languages"]
  value: string | undefined
  onChange: (language: string | undefined) => void
}

export function LanguageSelect({ languages, value, onChange }: LanguageSelectProps) {
  const selected = languages.find((entry) => entry.language === value)

  return (
    <Select
      onValueChange={(next) => {
        onChange(next === null || next === ALL_LANGUAGES ? undefined : next)
      }}
      value={value ?? ALL_LANGUAGES}
    >
      <SelectTrigger aria-label={m.media_chapters_language()} sx={styles.trigger}>
        <SelectValue>
          {() => (
            <span sx={styles.triggerValue}>
              {selected === undefined ? (
                <Languages size={16} {...stylex.props(styles.triggerIcon)} />
              ) : (
                <LanguageFlag language={selected.language} />
              )}
              <span sx={styles.triggerText}>
                {selected === undefined
                  ? m.media_chapters_all_languages()
                  : getLanguageName(selected.language)}
              </span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectPopup>
        <SelectItem value={ALL_LANGUAGES}>
          <span sx={styles.item}>
            <Languages size={16} {...stylex.props(styles.triggerIcon)} />
            {m.media_chapters_all_languages()}
          </span>
        </SelectItem>
        {languages.map((entry) => (
          <SelectItem key={entry.language} value={entry.language}>
            <span sx={styles.item}>
              <LanguageFlag language={entry.language} />
              {getLanguageName(entry.language)}
              <span sx={styles.itemCount}>{entry.count}</span>
            </span>
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  )
}
