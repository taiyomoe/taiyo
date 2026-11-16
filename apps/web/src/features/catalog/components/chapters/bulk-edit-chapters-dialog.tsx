import type { SupportedLanguage } from "@taiyomoe/db/constants"
import { Book, Close, Edit, Users } from "@taiyomoe/ui/components/icons"
import { Field, FieldDescription, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { useState } from "react"
import type { GroupOption } from "@/features/groups/components/group-picker"
import { SUPPORTED_LANGUAGE_OPTIONS } from "@/components/fields/language-options"
import { type OptionSet, OptionalOptionSelect } from "@/components/fields/option-select"
import { useBulkUpdateChapters } from "@/features/catalog/api/catalog"
import { BulkEditDialog } from "@/features/catalog/components/shared/bulk-edit-dialog"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { GroupPicker } from "@/features/groups/components/group-picker"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const VOLUME_MODES = ["SET", "CLEAR"] as const
const GROUP_MODES = ["REPLACE"] as const
const VOLUME_MODE_OPTIONS: OptionSet<(typeof VOLUME_MODES)[number]> = {
  values: VOLUME_MODES,
  label: (mode) => (mode === "SET" ? m.catalog_bulk_volume_set() : m.catalog_bulk_volume_clear()),
  icon: (mode) => (mode === "SET" ? Edit : Close),
  fieldIcon: Book,
}
const GROUP_MODE_OPTIONS: OptionSet<(typeof GROUP_MODES)[number]> = {
  values: GROUP_MODES,
  label: () => m.catalog_bulk_groups_replace(),
  icon: () => Users,
  fieldIcon: Users,
}

export function BulkEditChaptersDialog({
  chapterIds,
  onClose,
  onDone,
}: {
  chapterIds: readonly string[] | null
  onClose: () => void
  onDone: () => void
}) {
  const update = useBulkUpdateChapters()
  const [volumeMode, setVolumeMode] = useState<(typeof VOLUME_MODES)[number] | undefined>()
  const [volume, setVolume] = useState("")
  const [language, setLanguage] = useState<SupportedLanguage | undefined>()
  const [groupMode, setGroupMode] = useState<(typeof GROUP_MODES)[number] | undefined>()
  const [groups, setGroups] = useState<GroupOption[]>([])
  const volumeChange = () => {
    if (volumeMode === "CLEAR") {
      return { volume: null }
    }

    return volumeMode === "SET" && volume.trim() !== "" ? { volume: volume.trim() } : {}
  }
  const changes = {
    ...volumeChange(),
    ...(language === undefined ? {} : { language }),
    ...(groupMode === undefined ? {} : { groupIds: groups.map((group) => group.id) }),
  }
  const close = () => {
    update.reset()
    setVolumeMode(undefined)
    setVolume("")
    setLanguage(undefined)
    setGroupMode(undefined)
    setGroups([])
    onClose()
  }
  const keep = m.catalog_bulk_unchanged()

  return (
    <BulkEditDialog
      changed={Object.keys(changes).length > 0}
      error={update.isError ? getErrorMessage(update.error) : null}
      onClose={close}
      onSubmit={() => {
        if (chapterIds !== null) {
          update.mutate(
            { chapterIds: [...chapterIds], ...changes },
            {
              onSuccess: (result) => {
                toastBulkResult(result, m.catalog_bulk_updated)
                onDone()
                close()
              },
            },
          )
        }
      }}
      open={chapterIds !== null}
      pending={update.isPending}
      title={m.catalog_chapter_bulk_edit_title({ count: chapterIds?.length ?? 0 })}
    >
      <Field>
        <FieldLabel>{m.catalog_bulk_volume()}</FieldLabel>
        <OptionalOptionSelect
          empty={keep}
          label={m.catalog_bulk_volume()}
          onChange={setVolumeMode}
          options={VOLUME_MODE_OPTIONS}
          value={volumeMode}
        />
        {volumeMode === "SET" ? (
          <Input
            aria-label={m.catalog_bulk_volume()}
            onChange={(event) => {
              setVolume(event.target.value)
            }}
            placeholder={m.media_images_volume_placeholder()}
            value={volume}
          />
        ) : null}
      </Field>
      <Field>
        <FieldLabel>{m.upload_language()}</FieldLabel>
        <OptionalOptionSelect
          empty={keep}
          label={m.upload_language()}
          onChange={setLanguage}
          options={SUPPORTED_LANGUAGE_OPTIONS}
          value={language}
        />
      </Field>
      <Field>
        <FieldLabel>{m.upload_groups()}</FieldLabel>
        <OptionalOptionSelect
          empty={keep}
          label={m.upload_groups()}
          onChange={setGroupMode}
          options={GROUP_MODE_OPTIONS}
          value={groupMode}
        />
        {groupMode === undefined ? null : (
          <>
            <GroupPicker onChange={setGroups} value={groups} />
            <FieldDescription>{m.catalog_bulk_groups_hint()}</FieldDescription>
          </>
        )}
      </Field>
    </BulkEditDialog>
  )
}
