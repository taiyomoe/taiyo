import type { MediaEditField } from "@taiyomoe/db/constants"
import type { ReactNode } from "react"
import type { EditorProps } from "@/features/media-suggestions/components/field-editors/editor-props"
import { dateEditor } from "@/features/media-suggestions/components/field-editors/date-editor"
import { enumEditor } from "@/features/media-suggestions/components/field-editors/enum-editor"
import { LinksEditor } from "@/features/media-suggestions/components/field-editors/links-editor"
import { StaffsEditor } from "@/features/media-suggestions/components/field-editors/staffs-editor"
import { SynopsisEditor } from "@/features/media-suggestions/components/field-editors/synopsis-editor"
import { TagsEditor } from "@/features/media-suggestions/components/field-editors/tags-editor"
import { TitlesEditor } from "@/features/media-suggestions/components/field-editors/titles-editor"
import {
  CONTENT_RATING_OPTIONS,
  MEDIA_COUNTRY_OPTIONS,
  MEDIA_DEMOGRAPHY_OPTIONS,
  MEDIA_SOURCE_OPTIONS,
  MEDIA_STATUS_OPTIONS,
  MEDIA_TYPE_OPTIONS,
} from "@/features/media/lib/media-options"
import { m } from "@/paraglide/messages"

const EDITORS: Record<MediaEditField, (props: EditorProps) => ReactNode> = {
  titles: TitlesEditor,
  synopsis: SynopsisEditor,
  type: enumEditor("type", MEDIA_TYPE_OPTIONS, m.media_info_type),
  status: enumEditor("status", MEDIA_STATUS_OPTIONS, m.media_info_status),
  source: enumEditor("source", MEDIA_SOURCE_OPTIONS, m.media_info_source),
  demography: enumEditor("demography", MEDIA_DEMOGRAPHY_OPTIONS, m.media_info_demography),
  countryOfOrigin: enumEditor("countryOfOrigin", MEDIA_COUNTRY_OPTIONS, m.media_info_country),
  contentRating: enumEditor("contentRating", CONTENT_RATING_OPTIONS, m.media_info_content_rating),
  startDate: dateEditor("startDate", m.media_edit_field_start_date),
  endDate: dateEditor("endDate", m.media_edit_field_end_date),
  tags: TagsEditor,
  links: LinksEditor,
  staffs: StaffsEditor,
}

export function FieldEditor({ field, ...props }: EditorProps & { field: MediaEditField }) {
  const Editor = EDITORS[field]

  return <Editor {...props} />
}
