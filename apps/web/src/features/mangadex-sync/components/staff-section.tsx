// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import type { MangaDexPlan } from "@/features/mangadex-sync/api/mangadex-sync"
import type { PlanSelection } from "@/features/mangadex-sync/hooks/use-plan-selection"
import { PlanOption } from "@/features/mangadex-sync/components/plan-option"
import { PlanSection } from "@/features/mangadex-sync/components/plan-section"
import { syncStyles } from "@/features/mangadex-sync/components/sync-styles"
import { m } from "@/paraglide/messages"

const ROLE_LABELS = { AUTHOR: m.mangadex_role_author, ARTIST: m.mangadex_role_artist }

export function StaffSection({
  staff,
  selection,
}: {
  staff: MangaDexPlan["staff"]
  selection: PlanSelection
}) {
  return (
    <PlanSection
      keys={staff.map((member) => member.key)}
      selection={selection}
      title={m.mangadex_section_staff()}
    >
      <ul sx={syncStyles.list}>
        {staff.map((member) => (
          <PlanOption
            key={member.key}
            description={
              member.staffId === null ? m.mangadex_staff_new() : m.mangadex_staff_existing()
            }
            itemKey={member.key}
            selection={selection}
            title={
              <>
                {member.name}
                <Badge variant="secondary">{ROLE_LABELS[member.role]()}</Badge>
              </>
            }
          />
        ))}
      </ul>
    </PlanSection>
  )
}
