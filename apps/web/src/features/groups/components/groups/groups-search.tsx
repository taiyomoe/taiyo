import * as stylex from "@stylexjs/stylex"
import { Search } from "@taiyomoe/ui/components/icons"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  search: {
    width: { default: "100%", "@media (width >= 40rem)": "20rem" },
  },
  searchIcon: {
    color: colors.mutedForeground,
  },
})

type GroupsSearchProps = {
  search: string | undefined
}

export function GroupsSearch({ search }: GroupsSearchProps) {
  const navigate = useNavigate({ from: "/groups/" })
  const [draft, setDraft] = useState(search ?? "")

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void navigate({ search: { q: draft.trim() === "" ? undefined : draft.trim() } })
      }}
      role="search"
      sx={styles.search}
    >
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <Search {...stylex.props(styles.searchIcon)} />
        </InputGroupAddon>
        <InputGroupInput
          aria-label={m.groups_search_placeholder()}
          onChange={(event) => {
            setDraft(event.target.value)
          }}
          placeholder={m.groups_search_placeholder()}
          type="search"
          value={draft}
        />
      </InputGroup>
    </form>
  )
}
