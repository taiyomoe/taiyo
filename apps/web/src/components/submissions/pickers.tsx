import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { LANGUAGES, type Language } from "@taiyomoe/db/constants"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxValue,
} from "@taiyomoe/ui/components/ui/combobox"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useDeferredValue, useState } from "react"
import { getLanguageName, LanguageFlag } from "@/components/chapters/flags"
import { groupsQueryOptions, myGroupsQueryOptions } from "@/lib/queries/groups"
import { searchMediasQueryOptions } from "@/lib/queries/medias"
import { m } from "@/paraglide/messages"

export type MediaOption = { id: string; title: string; type: string }

export type GroupOption = { id: string; name: string }

const styles = stylex.create({
  option: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
    width: "100%",
  },
  optionLabel: {
    overflow: "hidden",
    flexGrow: 1,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  muted: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
})

export function MediaPicker({
  value,
  onChange,
  invalid,
}: {
  value: MediaOption | null
  onChange: (value: MediaOption | null) => void
  invalid: boolean
}) {
  const [input, setInput] = useState("")
  const query = useDeferredValue(input.trim())
  const { data, isFetching } = useQuery({
    ...searchMediasQueryOptions({ q: query, page: 1, perPage: 10 }),
    enabled: query.length > 0,
  })
  const items: MediaOption[] = (data?.data ?? []).flatMap((hit) =>
    hit.mainTitle === null ? [] : [{ id: hit.id, title: hit.mainTitle.title, type: hit.type }],
  )
  let emptyMessage = isFetching ? m.upload_searching() : m.upload_media_empty()

  if (query.length === 0) {
    emptyMessage = m.upload_media_hint()
  }

  return (
    <Combobox<MediaOption>
      filter={null}
      inputValue={input}
      isItemEqualToValue={(a, b) => a.id === b.id}
      itemToStringLabel={(item) => item.title}
      items={
        value === null || items.some((item) => item.id === value.id) ? items : [value, ...items]
      }
      onInputValueChange={setInput}
      onValueChange={onChange}
      value={value}
    >
      <ComboboxInput
        aria-invalid={invalid || undefined}
        placeholder={m.upload_media_placeholder()}
      />
      <ComboboxPopup>
        <ComboboxList>
          {(item: MediaOption) => (
            <ComboboxItem key={item.id} value={item}>
              <span sx={styles.option}>
                <span sx={styles.optionLabel}>{item.title}</span>
                <span sx={styles.muted}>{item.type}</span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
      </ComboboxPopup>
    </Combobox>
  )
}

const LANGUAGE_OPTIONS = [...LANGUAGES]
  .map((code) => ({ code, name: getLanguageName(code) }))
  .sort((a, b) => a.name.localeCompare(b.name))

export function LanguagePicker({
  value,
  onChange,
}: {
  value: Language
  onChange: (value: Language) => void
}) {
  const selected = LANGUAGE_OPTIONS.find((option) => option.code === value) ?? null

  return (
    <Combobox<(typeof LANGUAGE_OPTIONS)[number]>
      isItemEqualToValue={(a, b) => a.code === b.code}
      itemToStringLabel={(item) => item.name}
      items={LANGUAGE_OPTIONS}
      onValueChange={(next) => {
        if (next !== null) {
          onChange(next.code)
        }
      }}
      value={selected}
    >
      <ComboboxInput
        placeholder={m.upload_language_placeholder()}
        startAddon={selected === null ? null : <LanguageFlag language={selected.code} />}
      />
      <ComboboxPopup>
        <ComboboxList>
          {(item: (typeof LANGUAGE_OPTIONS)[number]) => (
            <ComboboxItem key={item.code} value={item}>
              <span sx={styles.option}>
                <LanguageFlag language={item.code} />
                <span sx={styles.optionLabel}>{item.name}</span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>{m.upload_language_empty()}</ComboboxEmpty>
      </ComboboxPopup>
    </Combobox>
  )
}

export function GroupPicker({
  value,
  onChange,
  can,
}: {
  value: GroupOption[]
  onChange: (value: GroupOption[]) => void
  can: Permissions
}) {
  const [input, setInput] = useState("")
  const query = useDeferredValue(input.trim())
  const mine = useQuery(myGroupsQueryOptions)
  const found = useQuery({
    ...groupsQueryOptions({ search: query, page: 1 }),
    enabled: query.length > 0,
  })
  const candidates: GroupOption[] =
    query.length === 0
      ? (mine.data ?? []).map(({ group }) => ({ id: group.id, name: group.name }))
      : (found.data?.data ?? []).map((group) => ({ id: group.id, name: group.name }))
  const items = [
    ...value,
    ...candidates.filter((candidate) => !value.some((item) => item.id === candidate.id)),
  ]

  return (
    <Combobox<GroupOption, true>
      filter={null}
      inputValue={input}
      isItemEqualToValue={(a, b) => a.id === b.id}
      itemToStringLabel={(item) => item.name}
      items={items}
      multiple
      onInputValueChange={setInput}
      onValueChange={onChange}
      value={value}
    >
      <ComboboxChips>
        <ComboboxValue>
          {(selected: GroupOption[]) => (
            <>
              {selected.map((group) => (
                <ComboboxChip aria-label={group.name} key={group.id}>
                  {group.name}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                aria-label={m.upload_groups()}
                placeholder={selected.length > 0 ? undefined : m.upload_groups_placeholder()}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxPopup>
        <ComboboxList>
          {(group: GroupOption) => (
            <ComboboxItem key={group.id} value={group}>
              <span sx={styles.option}>
                <span sx={styles.optionLabel}>{group.name}</span>
                {can("group.uploadChapters", { id: group.id }) ? (
                  <Badge variant="success">{m.upload_group_publishes()}</Badge>
                ) : null}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>
          {query.length === 0 ? m.upload_groups_hint() : m.upload_groups_empty()}
        </ComboboxEmpty>
      </ComboboxPopup>
    </Combobox>
  )
}
