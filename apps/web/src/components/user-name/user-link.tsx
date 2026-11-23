import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { DELETED_USERNAME } from "@taiyomoe/db/constants"
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@taiyomoe/ui/components/ui/preview-card"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { Suspense } from "react"
import { type NameEffectProp, UserName } from "@/components/user-name/user-name"
import { UserHoverCardSkeleton } from "@/features/users/components/hover-card/user-hover-card-skeleton"
import { createLazyComponent } from "@/lib/lazy-component"
import { m } from "@/paraglide/messages"

// The card only downloads the first time someone hovers a name.
const UserHoverCard = createLazyComponent(
  async () =>
    (await import("@/features/users/components/hover-card/user-hover-card")).UserHoverCard,
)
const styles = stylex.create({
  link: {
    borderRadius: radius.sm,
    textDecoration: "none",
    color: "inherit",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    textDecorationColor: `color-mix(in srgb, ${colors.foreground} 45%, transparent)`,
    textDecorationLine: { default: "none", ":hover": "underline" },
    textDecorationThickness: "1px",
    textUnderlineOffset: "0.2em",
  },
  deleted: {
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
  popup: {
    padding: 0,
    overflow: "hidden",
    flexDirection: "column",
    textWrap: "pretty",
    width: "18.5rem",
  },
})

export type LinkedUser = {
  username: string
  displayUsername: string
  nameEffect: NameEffectProp
}

/** The name to show for a user, in the reader's language for the "Deleted user" account. */
export const getDisplayName = (user: { username: string; displayUsername: string }) =>
  user.username === DELETED_USERNAME ? m.deleted_user() : user.displayUsername

/**
 * A user's painted name that links to their profile and previews it on hover.
 * Use it wherever a name is shown, except inside another link or a preview of
 * the name itself.
 */
export function UserLink({ user, sx }: { user: LinkedUser; sx?: Sx }) {
  // It stands in for deleted accounts and has no profile to open.
  if (user.username === DELETED_USERNAME) {
    return <span sx={[styles.deleted, sx]}>{m.deleted_user()}</span>
  }

  return (
    <PreviewCard>
      <PreviewCardTrigger
        closeDelay={150}
        delay={450}
        render={<Link params={{ username: user.username }} to="/users/$username" />}
        sx={[styles.link, sx]}
      >
        <UserName effect={user.nameEffect} name={user.displayUsername} />
      </PreviewCardTrigger>
      <PreviewCardPopup align="start" sideOffset={8} sx={styles.popup}>
        <Suspense fallback={<UserHoverCardSkeleton />}>
          {/* Mounted on each open, so a download that failed offline is tried again on the next hover. */}
          <UserHoverCard fallback={<UserHoverCardSkeleton />} username={user.username} />
        </Suspense>
      </PreviewCardPopup>
    </PreviewCard>
  )
}
