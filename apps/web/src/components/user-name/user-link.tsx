import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@taiyomoe/ui/components/ui/preview-card"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { lazy, Suspense } from "react"
import { type NameEffectProp, UserName } from "@/components/user-name/user-name"
import { UserHoverCardSkeleton } from "@/features/users/components/hover-card/user-hover-card-skeleton"

// The card only downloads the first time someone hovers a name.
const UserHoverCard = lazy(async () => ({
  default: (await import("@/features/users/components/hover-card/user-hover-card")).UserHoverCard,
}))
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

/**
 * A user's painted name that links to their profile and previews it on hover.
 * Use it wherever a name is shown, except inside another link or a preview of
 * the name itself.
 */
export function UserLink({ user, sx }: { user: LinkedUser; sx?: Sx }) {
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
          <UserHoverCard username={user.username} />
        </Suspense>
      </PreviewCardPopup>
    </PreviewCard>
  )
}
