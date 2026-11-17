import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Link } from "@tanstack/react-router"
import type { RankedEntry } from "@/features/rankings/lib/ranking-entries"
import { UserLink } from "@/components/user-name/user-link"

/**
 * Links to the entity behind an entry: wrapping `children` (a thumbnail), or as its name, which
 * for a user is their painted name with the profile preview.
 */
export function EntryLink({
  entry,
  sx,
  children,
}: {
  entry: RankedEntry
  sx: Sx
  children?: ReactNode
}) {
  const { link } = entry

  if (link.to === "/users/$username") {
    return children === undefined ? (
      <UserLink
        sx={sx}
        user={{
          username: link.params.username,
          displayUsername: entry.name,
          nameEffect: entry.nameEffect,
        }}
      />
    ) : (
      <Link aria-label={entry.name} params={link.params} to={link.to} {...stylex.props(sx)}>
        {children}
      </Link>
    )
  }

  return (
    <Link
      aria-label={children === undefined ? undefined : entry.name}
      params={link.params}
      to={link.to}
      {...stylex.props(sx)}
    >
      {children ?? entry.name}
    </Link>
  )
}
