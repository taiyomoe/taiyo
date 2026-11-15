import * as stylex from "@stylexjs/stylex"
import { Search } from "@taiyomoe/ui/components/icons"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useEffect, useEffectEvent, useState } from "react"
import { m } from "@/paraglide/messages"

const SEARCH_DEBOUNCE_MS = 300
const styles = stylex.create({
  search: {
    flexBasis: "16rem",
    flexGrow: 1,
    minWidth: 0,
  },
  searchIcon: {
    color: colors.mutedForeground,
  },
})

export function ChapterSearchField({
  value,
  onSearch,
  placeholder = m.media_chapters_search(),
}: {
  value: string
  onSearch: (q?: string) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const [synced, setSynced] = useState(value)
  const search = useEffectEvent((q: string) => {
    onSearch(q === "" ? undefined : q)
  })

  if (synced !== value) {
    setSynced(value)

    if ((draft ?? "").trim() !== value) {
      setDraft(null)
    }
  }

  useEffect(() => {
    const pending = draft !== null && draft.trim() !== value
    const timer = pending
      ? setTimeout(() => {
          search(draft.trim())
        }, SEARCH_DEBOUNCE_MS)
      : undefined

    return () => {
      clearTimeout(timer)
    }
  }, [draft, value])

  return (
    <InputGroup sx={styles.search}>
      <InputGroupAddon>
        <Search {...stylex.props(styles.searchIcon)} />
      </InputGroupAddon>
      <InputGroupInput
        aria-label={placeholder}
        enterKeyHint="search"
        maxLength={100}
        onChange={(event) => {
          setDraft(event.target.value)
        }}
        placeholder={placeholder}
        type="search"
        value={draft ?? value}
      />
    </InputGroup>
  )
}
