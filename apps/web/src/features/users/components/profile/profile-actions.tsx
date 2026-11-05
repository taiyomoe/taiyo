import * as stylex from "@stylexjs/stylex"
import { Edit, Sparkles } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { lazy, Suspense, useState } from "react"
import type { UserProfile } from "@/features/users/api/profile"
import type { Session } from "@/lib/session"
import { FollowButton } from "@/features/users/components/profile/follow-button"
import { m } from "@/paraglide/messages"

// The owner-only dialog is code-split: visitors never download it.
const CustomizeDialog = lazy(async () => ({
  default: (await import("@/features/users/components/profile/dialogs/customize-dialog"))
    .CustomizeDialog,
}))
const styles = stylex.create({
  customize: {
    paddingInline: { default: 0, [breakpoints.sm]: "calc(1rem - 1px)" },
    width: { default: "2rem", [breakpoints.sm]: "auto" },
  },
  wideOnly: {
    display: { default: "none", [breakpoints.sm]: "inline" },
  },
  root: {
    gap: "0.5rem",
    display: "flex",
    flexShrink: 0,
    justifyContent: "flex-end",
  },
})

export function ProfileActions({
  profile,
  viewer,
}: {
  profile: UserProfile
  viewer: Session["user"] | null
}) {
  const [customizing, setCustomizing] = useState(false)

  if (viewer === null) {
    return null
  }

  if (viewer.id !== profile.id) {
    return (
      <div sx={styles.root}>
        <FollowButton profile={profile} />
      </div>
    )
  }

  return (
    <div sx={styles.root}>
      <Button
        onClick={() => {
          setCustomizing(true)
        }}
        sx={styles.customize}
        variant="outline"
        aria-label={m.profile_customize()}
      >
        <Sparkles />
        <span sx={styles.wideOnly}>{m.profile_customize()}</span>
      </Button>
      <Button render={<Link to="/settings" />} variant="outline">
        <Edit />
        {m.profile_edit()}
      </Button>
      {customizing ? (
        <Suspense>
          <CustomizeDialog
            onClose={() => {
              setCustomizing(false)
            }}
            profile={profile}
          />
        </Suspense>
      ) : null}
    </div>
  )
}
