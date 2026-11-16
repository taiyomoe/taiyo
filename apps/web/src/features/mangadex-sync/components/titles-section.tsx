// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import type { MangaDexPlan } from "@/features/mangadex-sync/api/mangadex-sync"
import type { PlanSelection } from "@/features/mangadex-sync/hooks/use-plan-selection"
import { LanguageChip } from "@/components/flags/flags"
import { PlanOption } from "@/features/mangadex-sync/components/plan-option"
import { PlanSection } from "@/features/mangadex-sync/components/plan-section"
import { syncStyles } from "@/features/mangadex-sync/components/sync-styles"
import { m } from "@/paraglide/messages"

export function TitlesSection({
  titles,
  selection,
}: {
  titles: MangaDexPlan["titles"]
  selection: PlanSelection
}) {
  return (
    <PlanSection
      keys={titles.map((title) => title.key)}
      selection={selection}
      title={m.mangadex_section_titles()}
    >
      <ul sx={syncStyles.list}>
        {titles.map((title) => (
          <PlanOption
            key={title.key}
            itemKey={title.key}
            selection={selection}
            title={
              <>
                <LanguageChip language={title.language} />
                {title.title}
              </>
            }
          />
        ))}
      </ul>
    </PlanSection>
  )
}
