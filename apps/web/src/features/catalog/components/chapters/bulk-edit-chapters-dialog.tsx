import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@taiyomoe/db/constants"
import { Book, Languages, Users } from "@taiyomoe/ui/components/icons"
import { Field, FieldDescription, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { useState } from "react"
import type { GroupOption } from "@/features/groups/components/group-picker"
import { LanguageFlag } from "@/components/flags/flags"
import { getLanguageName } from "@/components/flags/language-flags"
import { useBulkUpdateChapters } from "@/features/catalog/api/catalog"
import { BulkEditDialog } from "@/features/catalog/components/shared/bulk-edit-dialog"
import { CatalogSelectControl } from "@/features/catalog/components/shared/catalog-toolbar"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { GroupPicker } from "@/features/groups/components/group-picker"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const VOLUME_MODES = ["SET", "CLEAR"] as const
const GROUP_MODES = ["REPLACE"] as const

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
        <CatalogSelectControl
          allLabel={keep}
          getLabel={(mode) =>
            mode === "SET" ? m.catalog_bulk_volume_set() : m.catalog_bulk_volume_clear()
          }
          icon={Book}
          label={m.catalog_bulk_volume()}
          onChange={setVolumeMode}
          options={VOLUME_MODES}
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
        <CatalogSelectControl
          allLabel={keep}
          getLabel={getLanguageName}
          icon={Languages}
          label={m.upload_language()}
          onChange={setLanguage}
          options={SUPPORTED_LANGUAGES}
          renderIcon={(option) => <LanguageFlag language={option} />}
          value={language}
        />
      </Field>
      <Field>
        <FieldLabel>{m.upload_groups()}</FieldLabel>
        <CatalogSelectControl
          allLabel={keep}
          getLabel={() => m.catalog_bulk_groups_replace()}
          icon={Users}
          label={m.upload_groups()}
          onChange={setGroupMode}
          options={GROUP_MODES}
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
