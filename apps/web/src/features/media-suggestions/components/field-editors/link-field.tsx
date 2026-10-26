import { type MEDIA_LINK_KEYS, MEDIA_LINK_NUMBER_KEYS } from "@taiyomoe/db/constants"
import { Field, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import {
  type MediaEditDraft,
  getLinkError,
} from "@/features/media-suggestions/lib/media-edit-model"
import { MEDIA_LINKS } from "@/features/media/lib/media-labels"

const isNumberKey = (key: string) => (MEDIA_LINK_NUMBER_KEYS as readonly string[]).includes(key)
const LINK_PLACEHOLDERS: Partial<Record<string, string>> = {
  mangaDex: "0ca1627e-95dd-4118-892a-f144adf02256",
  anilist: "31224",
  myAnimeList: "1224",
}

type LinkFieldProps = {
  linkKey: (typeof MEDIA_LINK_KEYS)[number]
  links: MediaEditDraft["links"]
  onChange: (links: MediaEditDraft["links"]) => void
}

export function LinkField({ linkKey: key, links: value, onChange }: LinkFieldProps) {
  const current = value[key]
  const error = getLinkError(key, current)

  return (
    <Field invalid={error !== null}>
      <FieldLabel>{MEDIA_LINKS[key]?.label ?? key}</FieldLabel>
      <Input
        inputMode={isNumberKey(key) ? "numeric" : "url"}
        onChange={(event) => {
          const { [key]: _previous, ...rest } = value
          const text = isNumberKey(key)
            ? event.target.value.replace(/\D/g, "")
            : event.target.value.trim()

          if (text === "") {
            onChange(rest)
          } else {
            onChange({ ...rest, [key]: isNumberKey(key) ? Number(text) : text })
          }
        }}
        placeholder={LINK_PLACEHOLDERS[key] ?? "https://"}
        value={current === undefined ? "" : String(current)}
      />
      {error === null ? null : <FieldError match>{error}</FieldError>}
    </Field>
  )
}
