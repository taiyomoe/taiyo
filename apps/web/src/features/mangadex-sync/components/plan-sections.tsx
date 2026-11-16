// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { CheckCircle } from "@taiyomoe/ui/components/icons"
import type { MangaDexPlan } from "@/features/mangadex-sync/api/mangadex-sync"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { useStartMangaDexSync } from "@/features/mangadex-sync/api/mangadex-sync"
import { ChaptersSection } from "@/features/mangadex-sync/components/chapters-section"
import { CoversSection } from "@/features/mangadex-sync/components/covers-section"
import { FieldsSection } from "@/features/mangadex-sync/components/fields-section"
import { LinksSection } from "@/features/mangadex-sync/components/links-section"
import { StaffSection } from "@/features/mangadex-sync/components/staff-section"
import { SyncBar } from "@/features/mangadex-sync/components/sync-bar"
import { syncStyles } from "@/features/mangadex-sync/components/sync-styles"
import { SynopsesSection } from "@/features/mangadex-sync/components/synopses-section"
import { TagsSection } from "@/features/mangadex-sync/components/tags-section"
import { TitlesSection } from "@/features/mangadex-sync/components/titles-section"
import { planItems, usePlanSelection } from "@/features/mangadex-sync/hooks/use-plan-selection"
import { MediaImagesEmpty } from "@/features/media/components/media-images-empty"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export function PlanSections({
  mediaId,
  mangaDexId,
  plan,
  refreshing,
  onRefresh,
}: {
  mediaId: string
  mangaDexId: string | null
  plan: MangaDexPlan
  refreshing: boolean
  onRefresh: () => void
}) {
  const selection = usePlanSelection(plan)
  const start = useStartMangaDexSync(mediaId)
  const picked = planItems(plan).filter((item) => selection.selected.has(item.key))
  const count = (prefix: string) => picked.filter((item) => item.key.startsWith(prefix)).length

  if (planItems(plan).length === 0) {
    return (
      <MediaImagesEmpty
        description={m.mangadex_up_to_date_description({ title: plan.mangaDex.title })}
        icon={<CheckCircle />}
        title={m.mangadex_up_to_date()}
      />
    )
  }

  return (
    <div sx={syncStyles.column}>
      {plan.titles.length === 0 ? null : (
        <TitlesSection selection={selection} titles={plan.titles} />
      )}
      {plan.synopses.length === 0 ? null : (
        <SynopsesSection selection={selection} synopses={plan.synopses} />
      )}
      {plan.staff.length === 0 ? null : <StaffSection selection={selection} staff={plan.staff} />}
      {plan.tags.length === 0 ? null : (
        <TagsSection selection={selection} tags={plan.tags} unmatched={plan.unmatchedTags} />
      )}
      {plan.links.length === 0 ? null : <LinksSection links={plan.links} selection={selection} />}
      {plan.fields.length === 0 ? null : (
        <FieldsSection fields={plan.fields} selection={selection} />
      )}
      {plan.covers.length === 0 ? null : (
        <CoversSection covers={plan.covers} mangaDexId={plan.mangaDex.id} selection={selection} />
      )}
      {plan.chapters.length === 0 ? null : (
        <ChaptersSection
          chapters={plan.chapters}
          selection={selection}
          skipped={plan.skippedChapters}
        />
      )}
      <ErrorAlert message={start.isError ? getErrorMessage(start.error) : null} />
      <SyncBar
        chapters={count("chapter:")}
        covers={count("cover:")}
        onRefresh={onRefresh}
        onStart={() => {
          start.mutate({ mangaDexId, keys: picked.map((item) => item.key) })
        }}
        pending={start.isPending}
        picked={picked.length}
        refreshing={refreshing}
      />
    </div>
  )
}
