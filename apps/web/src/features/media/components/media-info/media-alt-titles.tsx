import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { getAltTitles } from "@/features/media/lib/media-labels"
import { LanguageFlag, getLanguageName } from "@/components/flags/flags"

const styles = stylex.create({
  titles: {
    margin: 0,
    padding: 0,
    gap: "0.625rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    gap: "0.625rem",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    fontSize: "0.9375rem",
    minWidth: 0,
  },
  titleText: {
    overflowWrap: "anywhere",
  },
  titleFlag: {
    flexShrink: 0,
  },
})

type MediaAltTitlesProps = {
  titles: ReturnType<typeof getAltTitles>
}

export function MediaAltTitles({ titles }: MediaAltTitlesProps) {
  return (
    <ul sx={styles.titles}>
      {titles.map((title) => (
        <li key={title.id} sx={styles.title}>
          <span sx={styles.titleFlag} title={getLanguageName(title.language)}>
            <LanguageFlag language={title.language} />
          </span>
          <span sx={styles.titleText}>{title.title}</span>
        </li>
      ))}
    </ul>
  )
}
