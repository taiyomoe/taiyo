import * as stylex from "@stylexjs/stylex"
import { Close, Search } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import { breakpoints, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { getRouteApi } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/library")
const SEARCH_DELAY_MS = 300
const styles = stylex.create({
  search: {
    borderRadius: radius.full,
    flexBasis: { default: "100%", [breakpoints.sm]: "16rem" },
    flexGrow: { default: 1, [breakpoints.sm]: 0 },
    flexShrink: 1,
    minWidth: 0,
  },
})

export function LibrarySearchField() {
  const navigate = routeApi.useNavigate()
  const search = routeApi.useSearch()
  const urlQ = search.q ?? ""
  const [value, setValue] = useState(urlQ)
  const [seenQ, setSeenQ] = useState(urlQ)
  const [pushedQ, setPushedQ] = useState(urlQ)

  if (urlQ !== seenQ) {
    setSeenQ(urlQ)

    if (urlQ !== pushedQ) {
      setValue(urlQ)
      setPushedQ(urlQ)
    }
  }

  useEffect(() => {
    const q = value.trim()
    const timer =
      q === pushedQ
        ? undefined
        : setTimeout(() => {
            setPushedQ(q)
            void navigate({
              replace: true,
              resetScroll: false,
              search: { ...search, page: undefined, q: q === "" ? undefined : q },
            })
          }, SEARCH_DELAY_MS)

    return () => {
      clearTimeout(timer)
    }
  }, [navigate, pushedQ, search, value])

  return (
    <InputGroup sx={styles.search}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        aria-label={m.library_search()}
        enterKeyHint="search"
        maxLength={100}
        onChange={(event) => {
          setValue(event.target.value)
        }}
        placeholder={m.library_search()}
        size="sm"
        type="text"
        value={value}
      />
      {value === "" ? null : (
        <InputGroupAddon align="inline-end">
          <Button
            aria-label={m.library_clear_search()}
            onClick={() => {
              setValue("")
            }}
            size="icon-xs"
            variant="ghost"
          >
            <Close />
          </Button>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
