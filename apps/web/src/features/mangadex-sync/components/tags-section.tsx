// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import type { MangaDexPlan } from "@/features/mangadex-sync/api/mangadex-sync"
import type { PlanSelection } from "@/features/mangadex-sync/hooks/use-plan-selection"
import { PlanOption } from "@/features/mangadex-sync/components/plan-option"
import { PlanSection } from "@/features/mangadex-sync/components/plan-section"
import { syncStyles } from "@/features/mangadex-sync/components/sync-styles"
import { getTagName } from "@/features/media-suggestions/lib/media-edit-labels"
import { m } from "@/paraglide/messages"

export function TagsSection({
  tags,
  unmatched,
  selection,
}: {
  tags: MangaDexPlan["tags"]
  unmatched: string[]
  selection: PlanSelection
}) {
  return (
    <PlanSection
      keys={tags.map((tag) => tag.key)}
      selection={selection}
      title={m.mangadex_section_tags()}
    >
      <ul sx={syncStyles.list}>
        {tags.map((tag) => (
          <PlanOption
            key={tag.key}
            itemKey={tag.key}
            selection={selection}
            title={getTagName(tag.tag)}
          />
        ))}
      </ul>
      {unmatched.length === 0 ? null : (
        <p sx={[syncStyles.muted, syncStyles.footnote]}>
          {m.mangadex_tags_unmatched({ tags: unmatched.join(", ") })}
        </p>
      )}
    </PlanSection>
  )
}
