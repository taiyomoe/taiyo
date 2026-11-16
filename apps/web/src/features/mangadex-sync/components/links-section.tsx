// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import type { MangaDexPlan } from "@/features/mangadex-sync/api/mangadex-sync"
import type { PlanSelection } from "@/features/mangadex-sync/hooks/use-plan-selection"
import { PlanOption } from "@/features/mangadex-sync/components/plan-option"
import { PlanSection } from "@/features/mangadex-sync/components/plan-section"
import { syncStyles } from "@/features/mangadex-sync/components/sync-styles"
import { MEDIA_LINKS } from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

export function LinksSection({
  links,
  selection,
}: {
  links: MangaDexPlan["links"]
  selection: PlanSelection
}) {
  return (
    <PlanSection
      keys={links.map((link) => link.key)}
      selection={selection}
      title={m.mangadex_section_links()}
    >
      <ul sx={syncStyles.list}>
        {links.map((link) => (
          <PlanOption
            key={link.key}
            description={MEDIA_LINKS[link.link]?.href(String(link.value)) ?? String(link.value)}
            itemKey={link.key}
            selection={selection}
            title={MEDIA_LINKS[link.link]?.label ?? link.link}
          />
        ))}
      </ul>
    </PlanSection>
  )
}
