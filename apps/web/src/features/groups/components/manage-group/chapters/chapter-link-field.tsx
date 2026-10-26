import { Field, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { m } from "@/paraglide/messages"

type ChapterLinkFieldProps = {
  value: string
  invalid: boolean
  onChange: (value: string) => void
}

export function ChapterLinkField({ value, invalid, onChange }: ChapterLinkFieldProps) {
  return (
    <Field invalid={invalid}>
      <FieldLabel>{m.upload_link()}</FieldLabel>
      <Input
        onChange={(event) => {
          onChange(event.target.value)
        }}
        placeholder="https://"
        type="url"
        value={value}
      />
      {invalid ? (
        <FieldError match>
          {value.trim() === "" ? m.upload_warning_link_required() : m.upload_link_invalid()}
        </FieldError>
      ) : null}
    </Field>
  )
}
