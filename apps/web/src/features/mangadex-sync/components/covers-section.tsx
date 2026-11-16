// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import type { MangaDexPlan } from "@/features/mangadex-sync/api/mangadex-sync"
import type { PlanSelection } from "@/features/mangadex-sync/hooks/use-plan-selection"
import { CoverOption } from "@/features/mangadex-sync/components/cover-option"
import { PlanSection } from "@/features/mangadex-sync/components/plan-section"
import { syncStyles } from "@/features/mangadex-sync/components/sync-styles"
import { m } from "@/paraglide/messages"

export function CoversSection({
  covers,
  mangaDexId,
  selection,
}: {
  covers: MangaDexPlan["covers"]
  mangaDexId: string
  selection: PlanSelection
}) {
  return (
    <PlanSection
      keys={covers.map((cover) => cover.key)}
      selection={selection}
      title={m.mangadex_section_covers()}
    >
      <div sx={syncStyles.grid}>
        {covers.map((cover) => (
          <CoverOption
            key={cover.key}
            cover={cover}
            mangaDexId={mangaDexId}
            selection={selection}
          />
        ))}
      </div>
    </PlanSection>
  )
}
