import type { Language } from "@taiyomoe/db/constants"
import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { Field, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { LanguagePicker } from "@/components/fields/language-picker"
import { type GroupOption, GroupPicker } from "@/features/groups/components/group-picker"
import { m } from "@/paraglide/messages"

type ReviewFixFieldsProps = {
  can: Permissions
  number: string
  numberInvalid: boolean
  volume: string
  title: string
  language: Language
  groups: GroupOption[]
  onNumberChange: (number: string) => void
  onVolumeChange: (volume: string) => void
  onTitleChange: (title: string) => void
  onLanguageChange: (language: Language) => void
  onGroupsChange: (groups: GroupOption[]) => void
}

const styles = stylex.create({
  row: {
    gap: "0.75rem",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
  },
})

export function ReviewFixFields({
  can,
  number,
  numberInvalid,
  volume,
  title,
  language,
  groups,
  onNumberChange,
  onVolumeChange,
  onTitleChange,
  onLanguageChange,
  onGroupsChange,
}: ReviewFixFieldsProps) {
  return (
    <>
      <div sx={styles.row}>
        <Field invalid={numberInvalid}>
          <FieldLabel>{m.upload_number()}</FieldLabel>
          <Input
            inputMode="decimal"
            onChange={(event) => {
              onNumberChange(event.target.value)
            }}
            value={number}
          />
        </Field>
        <Field>
          <FieldLabel>{m.upload_volume()}</FieldLabel>
          <Input
            onChange={(event) => {
              onVolumeChange(event.target.value)
            }}
            value={volume}
          />
        </Field>
      </div>
      <Field>
        <FieldLabel>{m.upload_chapter_title()}</FieldLabel>
        <Input
          onChange={(event) => {
            onTitleChange(event.target.value)
          }}
          value={title}
        />
      </Field>
      <Field>
        <FieldLabel>{m.upload_language()}</FieldLabel>
        <LanguagePicker onChange={onLanguageChange} value={language} />
      </Field>
      <Field>
        <FieldLabel>{m.upload_groups()}</FieldLabel>
        <GroupPicker can={can} onChange={onGroupsChange} value={groups} />
      </Field>
    </>
  )
}
