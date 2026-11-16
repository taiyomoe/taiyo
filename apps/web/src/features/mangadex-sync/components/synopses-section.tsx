import * as stylex from "@stylexjs/stylex"
import type { MangaDexPlan } from "@/features/mangadex-sync/api/mangadex-sync"
import type { PlanSelection } from "@/features/mangadex-sync/hooks/use-plan-selection"
import { LanguageChip } from "@/components/flags/flags"
import { PlanOption } from "@/features/mangadex-sync/components/plan-option"
import { PlanSection } from "@/features/mangadex-sync/components/plan-section"
import { syncStyles } from "@/features/mangadex-sync/components/sync-styles"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  text: { whiteSpace: "pre-line" },
})

export function SynopsesSection({
  synopses,
  selection,
}: {
  synopses: MangaDexPlan["synopses"]
  selection: PlanSelection
}) {
  return (
    <PlanSection
      keys={synopses.map((synopsis) => synopsis.key)}
      selection={selection}
      title={m.mangadex_section_synopses()}
    >
      <ul sx={syncStyles.list}>
        {synopses.map((synopsis) => (
          <PlanOption
            key={synopsis.key}
            description={<span sx={[syncStyles.clamp, styles.text]}>{synopsis.text}</span>}
            itemKey={synopsis.key}
            selection={selection}
            title={<LanguageChip language={synopsis.language} />}
          />
        ))}
      </ul>
    </PlanSection>
  )
}
