// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import type { MangaDexPlan } from "@/features/mangadex-sync/api/mangadex-sync"
import type { PlanSelection } from "@/features/mangadex-sync/hooks/use-plan-selection"
import { PlanOption } from "@/features/mangadex-sync/components/plan-option"
import { PlanSection } from "@/features/mangadex-sync/components/plan-section"
import { syncStyles } from "@/features/mangadex-sync/components/sync-styles"
import {
  CONTENT_RATING_LABELS,
  MEDIA_DEMOGRAPHY_LABELS,
  MEDIA_STATUS_LABELS,
} from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

type Field = MangaDexPlan["fields"][number]

const FIELD_LABELS: Record<Field["field"], () => string> = {
  status: m.mangadex_field_status,
  demography: m.mangadex_field_demography,
  contentRating: m.mangadex_field_content_rating,
  startDate: m.mangadex_field_start_date,
}
const formatValue = (field: Field["field"], value: string | null) => {
  if (value === null) {
    return m.mangadex_field_empty()
  }

  if (field === "startDate") {
    return String(new Date(value).getUTCFullYear())
  }

  const labels: Record<string, () => string> = {
    status: MEDIA_STATUS_LABELS,
    demography: MEDIA_DEMOGRAPHY_LABELS,
    contentRating: CONTENT_RATING_LABELS,
  }[field]

  return labels[value]?.() ?? value
}

export function FieldsSection({
  fields,
  selection,
}: {
  fields: MangaDexPlan["fields"]
  selection: PlanSelection
}) {
  return (
    <PlanSection
      keys={fields.map((field) => field.key)}
      selection={selection}
      title={m.mangadex_section_fields()}
    >
      <ul sx={syncStyles.list}>
        {fields.map((field) => (
          <PlanOption
            key={field.key}
            description={m.mangadex_field_change({
              current: formatValue(field.field, field.current),
              proposed: formatValue(field.field, field.proposed),
            })}
            itemKey={field.key}
            selection={selection}
            title={FIELD_LABELS[field.field]()}
          />
        ))}
      </ul>
    </PlanSection>
  )
}
