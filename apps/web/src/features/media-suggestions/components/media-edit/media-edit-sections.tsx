import type { MediaEditField } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import type { MediaEditDraft } from "@/features/media-suggestions/lib/media-edit-model"
import { MediaEditSection } from "@/features/media-suggestions/components/media-edit/media-edit-section"
import { m } from "@/paraglide/messages"

const DETAIL_FIELDS = [
  "type",
  "status",
  "source",
  "demography",
  "countryOfOrigin",
  "contentRating",
  "startDate",
  "endDate",
] as const satisfies MediaEditField[]
const SECTIONS: Array<{ title: () => string; fields: readonly MediaEditField[] }> = [
  { title: m.media_edit_field_titles, fields: ["titles"] },
  { title: m.media_edit_field_synopsis, fields: ["synopsis"] },
  { title: m.media_edit_section_details, fields: DETAIL_FIELDS },
  { title: m.media_edit_field_tags, fields: ["tags"] },
  { title: m.media_info_links, fields: ["links"] },
  { title: m.media_edit_field_staffs, fields: ["staffs"] },
]
const styles = stylex.create({
  sections: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
})

export function MediaEditSections({
  draft,
  changed,
  onChange,
}: {
  draft: MediaEditDraft
  changed: readonly MediaEditField[]
  onChange: (draft: MediaEditDraft) => void
}) {
  return (
    <div sx={styles.sections}>
      {SECTIONS.map((section) => (
        <MediaEditSection
          changed={section.fields.some((field) => changed.includes(field))}
          draft={draft}
          fields={section.fields}
          key={section.fields.join()}
          onChange={onChange}
          title={section.title()}
        />
      ))}
    </div>
  )
}
