import * as stylex from "@stylexjs/stylex"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxValue,
} from "@taiyomoe/ui/components/ui/combobox"
import { useQuery } from "@tanstack/react-query"
import { useDeferredValue, useState } from "react"
import { groupsQueryOptions, myGroupsQueryOptions } from "@/features/groups/api/groups"
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import { m } from "@/paraglide/messages"

export type GroupOption = { id: string; name: string; logo?: string | null }

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
})

export function GroupPicker({
  value,
  onChange,
}: {
  value: GroupOption[]
  onChange: (value: GroupOption[]) => void
}) {
  const [input, setInput] = useState("")
  const query = useDeferredValue(input.trim())
  const mine = useQuery(myGroupsQueryOptions)
  const found = useQuery({
    ...groupsQueryOptions({ search: query, page: 1 }),
    enabled: query.length > 0,
  })
  const candidates: GroupOption[] =
    query.length === 0 ? (mine.data ?? []).map(({ group }) => group) : (found.data?.data ?? [])
  const items = [
    ...value.map((item) => candidates.find((candidate) => candidate.id === item.id) ?? item),
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
                <GroupAvatar
                  id={group.id}
                  logoUrl={group.logo ?? null}
                  name={group.name}
                  size="xs"
                />
                <span sx={styles.optionLabel}>{group.name}</span>
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
