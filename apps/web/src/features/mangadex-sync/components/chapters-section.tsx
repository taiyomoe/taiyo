// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import type { MangaDexPlan } from "@/features/mangadex-sync/api/mangadex-sync"
import type { PlanSelection } from "@/features/mangadex-sync/hooks/use-plan-selection"
import { getLanguageName } from "@/components/flags/language-flags"
import { ChapterOption } from "@/features/mangadex-sync/components/chapter-option"
import { PlanSection } from "@/features/mangadex-sync/components/plan-section"
import { SelectAllCheckbox } from "@/features/mangadex-sync/components/select-all-checkbox"
import { syncStyles } from "@/features/mangadex-sync/components/sync-styles"
import { m } from "@/paraglide/messages"

export function ChaptersSection({
  chapters,
  skipped,
  selection,
}: {
  chapters: MangaDexPlan["chapters"]
  skipped: number
  selection: PlanSelection
}) {
  const languages = [...new Set(chapters.map((chapter) => chapter.language))]

  return (
    <PlanSection
      keys={chapters.map((chapter) => chapter.key)}
      selection={selection}
      title={m.mangadex_section_chapters()}
    >
      <div sx={syncStyles.scroll}>
        {languages.map((language) => {
          const group = chapters.filter((chapter) => chapter.language === language)
          const name = getLanguageName(language)

          return (
            <div key={language}>
              <label sx={syncStyles.subheader}>
                <SelectAllCheckbox
                  keys={group.map((chapter) => chapter.key)}
                  label={m.mangadex_select_section({ section: name })}
                  selection={selection}
                />
                {name}
                <span sx={syncStyles.count}>{group.length}</span>
              </label>
              <ul sx={syncStyles.plainList}>
                {group.map((chapter) => (
                  <ChapterOption key={chapter.key} chapter={chapter} selection={selection} />
                ))}
              </ul>
            </div>
          )
        })}
      </div>
      {skipped === 0 ? null : (
        <p sx={[syncStyles.muted, syncStyles.footnote]}>
          {m.mangadex_chapters_skipped({ count: skipped })}
        </p>
      )}
    </PlanSection>
  )
}
