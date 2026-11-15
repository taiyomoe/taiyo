import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import type { CoverLanguage } from "@/features/media/lib/media-images"
import { LanguageSelect } from "@/features/media/components/media-chapters/language-select"

const styles = stylex.create({
  toolbar: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  end: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    marginInlineStart: "auto",
    maxWidth: "100%",
    minWidth: 0,
  },
})

export function CoversToolbar({
  start,
  end,
  languages,
  language,
  onLanguageChange,
}: {
  start?: ReactNode
  end?: ReactNode
  languages: Array<{ language: CoverLanguage; count: number }>
  language: CoverLanguage | undefined
  onLanguageChange: (language: string | undefined) => void
}) {
  return (
    <div sx={styles.toolbar}>
      {start}
      {languages.length > 1 ? (
        <LanguageSelect languages={languages} onChange={onLanguageChange} value={language} />
      ) : null}
      {end === undefined ? null : <div sx={styles.end}>{end}</div>}
    </div>
  )
}
