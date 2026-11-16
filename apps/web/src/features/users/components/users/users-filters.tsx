import { UserRemove } from "@taiyomoe/ui/components/icons"
import type { UsersFilter } from "@/features/users/api/users"
import {
  FilterSearch,
  FilterSelect,
  FilterToggle,
  FilterToolbar,
} from "@/components/filters/filter-toolbar"
import { ROLE_OPTIONS } from "@/features/users/lib/role-labels"
import { m } from "@/paraglide/messages"

export function UsersFilters({
  filter,
  onChange,
}: {
  filter: UsersFilter
  onChange: (patch: Partial<UsersFilter>) => void
}) {
  return (
    <FilterToolbar>
      <FilterSearch
        label={m.users_search()}
        onChange={(search) => {
          onChange({ search })
        }}
        value={filter.search}
      />
      <FilterSelect
        allLabel={m.users_all_roles()}
        label={m.users_role()}
        onChange={(role) => {
          onChange({ role })
        }}
        options={ROLE_OPTIONS}
        value={filter.role}
      />
      <FilterToggle
        icon={UserRemove}
        label={m.users_only_banned()}
        onChange={(banned) => {
          onChange({ banned: banned ? true : undefined })
        }}
        pressed={filter.banned === true}
      />
    </FilterToolbar>
  )
}
