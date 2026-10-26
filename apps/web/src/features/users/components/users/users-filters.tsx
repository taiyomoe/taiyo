import * as stylex from "@stylexjs/stylex"
import { ROLES } from "@taiyomoe/permissions"
import { Search } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { useState } from "react"
import type { UsersFilter } from "@/features/users/api/users"
import { ROLE_LABELS } from "@/features/users/lib/role-labels"
import { m } from "@/paraglide/messages"

const ALL = "ALL"
const styles = stylex.create({
  filters: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  search: {
    flexGrow: 1,
    maxWidth: "24rem",
    minWidth: "14rem",
  },
  filter: {
    width: "11rem",
  },
})

type UsersFiltersProps = {
  filter: UsersFilter
  onChange: (patch: Partial<UsersFilter>) => void
}

export function UsersFilters({ filter, onChange }: UsersFiltersProps) {
  const [input, setInput] = useState(filter.search ?? "")

  return (
    <div sx={styles.filters}>
      <div sx={styles.search}>
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            aria-label={m.users_search()}
            onChange={(event) => {
              setInput(event.target.value)
              onChange({
                search: event.target.value.trim() === "" ? undefined : event.target.value.trim(),
              })
            }}
            placeholder={m.users_search()}
            value={input}
          />
        </InputGroup>
      </div>
      <div sx={styles.filter}>
        <Select
          onValueChange={(next) => {
            onChange({ role: ROLES.find((role) => role === next) })
          }}
          value={filter.role ?? ALL}
        >
          <SelectTrigger aria-label={m.users_role()}>
            <SelectValue>
              {() => (filter.role === undefined ? m.users_all_roles() : ROLE_LABELS[filter.role]())}
            </SelectValue>
          </SelectTrigger>
          <SelectPopup>
            <SelectItem value={ALL}>{m.users_all_roles()}</SelectItem>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_LABELS[role]()}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      </div>
      <Button
        aria-pressed={filter.banned === true}
        onClick={() => {
          onChange({ banned: filter.banned === true ? undefined : true })
        }}
        variant={filter.banned === true ? "secondary" : "outline"}
      >
        {m.users_only_banned()}
      </Button>
    </div>
  )
}
