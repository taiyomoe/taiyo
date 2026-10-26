import * as stylex from "@stylexjs/stylex"
import { Search } from "@taiyomoe/ui/components/icons"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import { Kbd, KbdGroup } from "@taiyomoe/ui/components/ui/kbd"
import { consts } from "@taiyomoe/ui/styles/tokens.stylex"
import { useEffect, useRef } from "react"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  search: {
    display: { default: "none", [consts.sm]: "flex" },
    flexBasis: "22rem",
    flexGrow: "0",
    flexShrink: "1",
    minWidth: 0,
  },
  field: {
    width: "100%",
  },
  searchIcon: {
    height: "1.125rem",
    width: "1.125rem",
  },
})

export function AppNavbarSearch() {
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  return (
    <div role="search" sx={styles.search}>
      <InputGroup sx={styles.field}>
        <InputGroupAddon>
          <Search {...stylex.props(styles.searchIcon)} />
        </InputGroupAddon>
        <InputGroupInput
          aria-label={m.shell_search_label()}
          placeholder={m.shell_search_placeholder()}
          ref={searchRef}
        />
        <InputGroupAddon align="inline-end">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
