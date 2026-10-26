import type { ReactNode } from "react"
import {
  CONTENT_RATINGS,
  MEDIA_COUNTRIES_OF_ORIGIN,
  MEDIA_DEMOGRAPHIES,
  MEDIA_SOURCES,
  MEDIA_STATUSES,
  MEDIA_TYPES,
  type MediaEditField,
} from "@taiyomoe/db/constants"
import type { EditorProps } from "@/features/media-suggestions/components/field-editors/editor-props"
import { dateEditor } from "@/features/media-suggestions/components/field-editors/date-editor"
import { enumEditor } from "@/features/media-suggestions/components/field-editors/enum-editor"
import { LinksEditor } from "@/features/media-suggestions/components/field-editors/links-editor"
import { StaffsEditor } from "@/features/media-suggestions/components/field-editors/staffs-editor"
import { SynopsisEditor } from "@/features/media-suggestions/components/field-editors/synopsis-editor"
import { TagsEditor } from "@/features/media-suggestions/components/field-editors/tags-editor"
import { TitlesEditor } from "@/features/media-suggestions/components/field-editors/titles-editor"
import {
  CONTENT_RATING_LABELS,
  MEDIA_COUNTRY_LABELS,
  MEDIA_DEMOGRAPHY_LABELS,
  MEDIA_SOURCE_LABELS,
  MEDIA_STATUS_LABELS,
  MEDIA_TYPE_LABELS,
} from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

const EDITORS: Record<MediaEditField, (props: EditorProps) => ReactNode> = {
  titles: TitlesEditor,
  synopsis: SynopsisEditor,
  type: enumEditor("type", MEDIA_TYPES, MEDIA_TYPE_LABELS, m.media_info_type),
  status: enumEditor("status", MEDIA_STATUSES, MEDIA_STATUS_LABELS, m.media_info_status),
  source: enumEditor("source", MEDIA_SOURCES, MEDIA_SOURCE_LABELS, m.media_info_source),
  demography: enumEditor(
    "demography",
    MEDIA_DEMOGRAPHIES,
    MEDIA_DEMOGRAPHY_LABELS,
    m.media_info_demography,
  ),
  countryOfOrigin: enumEditor(
    "countryOfOrigin",
    MEDIA_COUNTRIES_OF_ORIGIN,
    MEDIA_COUNTRY_LABELS,
    m.media_info_country,
  ),
  contentRating: enumEditor(
    "contentRating",
    CONTENT_RATINGS,
    CONTENT_RATING_LABELS,
    m.media_info_content_rating,
  ),
  startDate: dateEditor("startDate", m.media_edit_field_start_date),
  endDate: dateEditor("endDate", m.media_edit_field_end_date),
  tags: TagsEditor,
  links: LinksEditor,
  staffs: StaffsEditor,
}

type FieldEditorProps = EditorProps & { field: MediaEditField }

export function FieldEditor({ field, ...props }: FieldEditorProps) {
  const Editor = EDITORS[field]

  return <Editor {...props} />
}
