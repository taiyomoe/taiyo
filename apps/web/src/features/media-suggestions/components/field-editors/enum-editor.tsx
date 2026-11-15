import type { EditorProps } from "@/features/media-suggestions/components/field-editors/editor-props"
import type { MediaEditDraft } from "@/features/media-suggestions/lib/media-edit-model"
import { EnumSelect } from "@/features/media-suggestions/components/field-editors/enum-select"

export const enumEditor =
  <K extends "type" | "status" | "source" | "demography" | "countryOfOrigin" | "contentRating">(
    key: K,
    options: ReadonlyArray<MediaEditDraft[K]>,
    labels: Record<MediaEditDraft[K], () => string>,
    label: () => string,
  ) =>
  ({ draft, onChange }: EditorProps) => (
    <EnumSelect
      label={label()}
      labels={labels}
      onChange={(next) => {
        onChange({ ...draft, [key]: next })
      }}
      options={options}
      value={draft[key]}
    />
  )
