// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import type { EditorProps } from "@/features/media-suggestions/components/field-editors/editor-props"
import type { MediaEditStaff } from "@/features/media-suggestions/lib/media-edit-model"
import { fieldEditorStyles } from "@/features/media-suggestions/components/field-editors/field-editor-styles"
import { StaffPicker } from "@/features/media-suggestions/components/field-editors/staff-picker"
import { StaffRow } from "@/features/media-suggestions/components/field-editors/staff-row"
import { useRowKeys } from "@/features/media-suggestions/hooks/use-row-keys"
import { m } from "@/paraglide/messages"

export function StaffsEditor({ draft, onChange: change }: EditorProps) {
  const value = draft.staffs
  const onChange = (next: MediaEditStaff[]) => {
    change({ ...draft, staffs: next })
  }
  const rows = useRowKeys(value.length)

  return (
    <div sx={fieldEditorStyles.stack}>
      {value.length === 0 ? <p sx={fieldEditorStyles.muted}>{m.media_edit_staff_empty()}</p> : null}
      {value.map((staff, index) => (
        <StaffRow
          key={rows.keys[index]}
          onRemove={() => {
            rows.remove(index)
            onChange(value.filter((_, i) => i !== index))
          }}
          onRoleChange={(role) => {
            onChange(value.map((item, i) => (i === index ? { ...item, role } : item)))
          }}
          staff={staff}
        />
      ))}
      <StaffPicker
        onPick={(staff) => {
          rows.add()
          onChange([...value, { staffId: staff.id, name: staff.name, role: "AUTHOR" }])
        }}
      />
    </div>
  )
}
