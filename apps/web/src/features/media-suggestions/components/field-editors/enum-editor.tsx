import type { OptionSet } from "@/components/fields/option-select"
import type { EditorProps } from "@/features/media-suggestions/components/field-editors/editor-props"
import type { MediaEditDraft } from "@/features/media-suggestions/lib/media-edit-model"
import { OptionSelect } from "@/components/fields/option-select"

export const enumEditor =
  <K extends "type" | "status" | "source" | "demography" | "countryOfOrigin" | "contentRating">(
    key: K,
    options: OptionSet<MediaEditDraft[K]>,
    label: () => string,
  ) =>
  ({ draft, onChange }: EditorProps) => (
    <OptionSelect
      label={label()}
      onChange={(next) => {
        onChange({ ...draft, [key]: next })
      }}
      options={options}
      value={draft[key]}
    />
  )
