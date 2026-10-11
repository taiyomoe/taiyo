import * as stylex from "@stylexjs/stylex"
import { Link, useNavigate, useRouterState } from "@tanstack/react-router"
import { Search, User } from "@taiyomoe/ui/components/icons"
import { TaiyoLogoLockup } from "@taiyomoe/ui/components/logos/taiyo-logo-lockup"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import { SidebarTrigger } from "@taiyomoe/ui/components/ui/sidebar"
import { focus } from "@taiyomoe/ui/styles/recipes"
import { colors, consts } from "@taiyomoe/ui/styles/tokens.stylex"
import type { FormEvent } from "react"

import { m } from "@/paraglide/messages"

const styles = stylex.create({
  bar: {
    gap: "0.75rem",
    paddingInline: { default: "0.75rem", [consts.sm]: "1.25rem" },
    alignItems: "center",
    backdropFilter: "blur(12px)",
    backgroundColor: `color-mix(in srgb, ${colors.background} 82%, transparent)`,
    display: "flex",
    position: "sticky",
    zIndex: 10,
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    height: "4rem",
    top: 0,
  },
  brand: {
    borderRadius: "0.5rem",
    textDecoration: "none",
    color: colors.foreground,
    flexShrink: 0,
    fontSize: "1.125rem",
  },
  search: {
    flex: "1",
    marginInline: "auto",
    maxWidth: "28rem",
  },
  signInLabel: {
    display: { default: "none", [consts.sm]: "inline" },
  },
})

export function AppNav() {
  const navigate = useNavigate()
  const query = useRouterState({
    select: (state) => {
      const q = (state.location.search as { q?: unknown }).q

      return typeof q === "string" ? q : ""
    },
  })
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const q = new FormData(event.currentTarget).get("q")
    const trimmed = typeof q === "string" ? q.trim() : ""

    void navigate({ to: "/titles", search: trimmed ? { q: trimmed } : {} })
  }

  return (
    <header sx={styles.bar}>
      <SidebarTrigger />
      <Link aria-label={m.app_home_aria()} to="/" {...stylex.props(styles.brand, focus.control)}>
        <TaiyoLogoLockup />
      </Link>
      <form onSubmit={onSubmit} role="search" sx={styles.search}>
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            aria-label={m.app_search_label()}
            defaultValue={query}
            key={query}
            name="q"
            placeholder={m.app_search_placeholder()}
            type="search"
          />
        </InputGroup>
      </form>
      <Button aria-label={m.auth_sign_in()} render={<Link to="/auth/sign-in" />} variant="outline">
        <User />
        <span sx={styles.signInLabel}>{m.auth_sign_in()}</span>
      </Button>
    </header>
  )
}
