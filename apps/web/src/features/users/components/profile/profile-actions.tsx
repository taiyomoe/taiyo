import * as stylex from "@stylexjs/stylex"
import { Edit, Sparkles } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { Suspense, useState } from "react"
import type { UserProfile } from "@/features/users/api/profile"
import type { Session } from "@/lib/session"
import { ReportUserDialog } from "@/features/user-reports/components/report-user-dialog"
import { FollowButton } from "@/features/users/components/profile/follow-button"
import { createLazyComponent } from "@/lib/lazy-component"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

// The owner-only and staff-only dialogs are code-split: visitors never download them.
const CustomizeDialog = createLazyComponent(
  async () =>
    (await import("@/features/users/components/profile/dialogs/customize-dialog")).CustomizeDialog,
)
const ModerateProfileDialog = createLazyComponent(
  async () =>
    (await import("@/features/users/components/users/moderate-profile-dialog"))
      .ModerateProfileDialog,
)
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
  const can = getPermissions(viewer)
  const [customizing, setCustomizing] = useState(false)
  const [moderating, setModerating] = useState(false)

  if (viewer === null) {
    return null
  }

  if (viewer.id !== profile.id) {
    return (
      <div sx={styles.root}>
        {can("user.moderateProfile", { id: profile.id, role: profile.role }) ? (
          <Button
            aria-label={m.profile_edit()}
            onClick={() => {
              setModerating(true)
            }}
            size="icon"
            title={m.profile_edit()}
            variant="outline"
          >
            <Edit />
          </Button>
        ) : null}
        <ReportUserDialog user={profile} />
        <FollowButton profile={profile} />
        {moderating ? (
          <ModerateProfileDialog
            onClose={() => {
              setModerating(false)
            }}
            user={profile}
          />
        ) : null}
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
