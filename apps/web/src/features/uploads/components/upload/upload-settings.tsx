import type { Language } from "@taiyomoe/db/constants"
import type { Permissions } from "@taiyomoe/permissions"
// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { Field, FieldDescription, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import type { ReleaseSettings } from "@/features/uploads/lib/chapter-batch/release"
import { LanguagePicker } from "@/components/fields/language-picker"
import { type GroupOption, GroupPicker } from "@/features/groups/components/group-picker"
import { MediaField, type MediaOption } from "@/features/uploads/components/upload/media-field"
import { PublishAlert } from "@/features/uploads/components/upload/publish-alert"
import { ReleaseField } from "@/features/uploads/components/upload/release-field"
import { uploadStyles } from "@/features/uploads/components/upload/upload-styles"
import { NUMBER_TOKEN } from "@/features/uploads/lib/chapter-batch/links"
import { m } from "@/paraglide/messages"

type UploadSettingsProps = {
  can: Permissions
  attempted: boolean
  media: MediaOption | null
  onMediaChange: (media: MediaOption | null) => void
  language: Language
  onLanguageChange: (language: Language) => void
  groups: GroupOption[]
  onGroupsChange: (groups: GroupOption[]) => void
  release: ReleaseSettings
  planError: string | null
  onReleaseChange: (patch: Partial<ReleaseSettings>) => void
  rowCount: number
  template: string
  templateInvalid: boolean
  onTemplateChange: (template: string) => void
  publishes: boolean
  pendingCount: number | undefined
  slotsLeft: number
}

export function UploadSettings({
  can,
  attempted,
  media,
  onMediaChange,
  language,
  onLanguageChange,
  groups,
  onGroupsChange,
  release,
  planError,
  onReleaseChange,
  rowCount,
  template,
  templateInvalid,
  onTemplateChange,
  publishes,
  pendingCount,
  slotsLeft,
}: UploadSettingsProps) {
  const releaseError =
    release.mode === "date" && release.date === null && !attempted ? null : planError

  return (
    <div sx={uploadStyles.card}>
      <h2 sx={uploadStyles.cardTitle}>{m.upload_settings()}</h2>
      <MediaField invalid={attempted && media === null} onChange={onMediaChange} value={media} />
      <Field>
        <FieldLabel>{m.upload_language()}</FieldLabel>
        <LanguagePicker onChange={onLanguageChange} value={language} />
      </Field>
      <Field>
        <FieldLabel>{m.upload_groups()}</FieldLabel>
        <GroupPicker can={can} onChange={onGroupsChange} value={groups} />
        <FieldDescription>{m.upload_groups_description()}</FieldDescription>
      </Field>
      <ReleaseField
        error={releaseError}
        onChange={onReleaseChange}
        release={release}
        rowCount={rowCount}
      />
      <Field invalid={templateInvalid}>
        <FieldLabel>{m.upload_link()}</FieldLabel>
        <Input
          maxLength={config.input.maxUrlLength}
          onChange={(event) => {
            onTemplateChange(event.target.value)
          }}
          placeholder={m.upload_link_placeholder({ token: NUMBER_TOKEN })}
          type="url"
          value={template}
        />
        <FieldDescription>{m.upload_link_description({ token: NUMBER_TOKEN })}</FieldDescription>
        {templateInvalid ? <FieldError match>{m.upload_link_invalid()}</FieldError> : null}
      </Field>
      <PublishAlert
        mode={release.mode}
        pendingCount={pendingCount}
        publishes={publishes}
        slotsLeft={slotsLeft}
      />
    </div>
  )
}
