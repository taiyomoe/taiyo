import * as stylex from "@stylexjs/stylex"
import { Edit, Sparkles } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints, colors, font, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { getRouteApi } from "@tanstack/react-router"
import { lazy, Suspense, useState } from "react"
import type { UserProfile } from "@/features/users/api/profile"
import type { Session } from "@/lib/session"
import { FollowListDialog } from "@/features/users/components/profile/dialogs/follow-list-dialog"
import { FollowButton } from "@/features/users/components/profile/follow-button"
import { m } from "@/paraglide/messages"

// The owner-only dialogs are code-split: visitors never download them.
const EditProfileDialog = lazy(async () => ({
  default: (await import("@/features/users/components/profile/dialogs/edit-profile-dialog"))
    .EditProfileDialog,
}))
const CustomizeDialog = lazy(async () => ({
  default: (await import("@/features/users/components/profile/dialogs/customize-dialog"))
    .CustomizeDialog,
}))
const routeApi = getRouteApi("/users/$username")
const styles = stylex.create({
  root: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  buttons: {
    gap: "0.5rem",
    display: "grid",
    gridTemplateColumns: { default: "repeat(2, minmax(0, 1fr))", [breakpoints.lg]: "1fr" },
  },
  single: {
    gridColumnEnd: "-1",
    gridColumnStart: "1",
  },
  counts: {
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: colors.card,
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(4, minmax(0, 1fr))",
      [breakpoints.lg]: "repeat(2, minmax(0, 1fr))",
    },
  },
  count: {
    borderStyle: "none",
    gap: "0.125rem",
    paddingBlock: "0.75rem",
    paddingInline: "0.25rem",
    textDecoration: "none",
    alignItems: "center",
    backgroundColor: { default: "transparent", ":hover": colors.chipHover },
    borderInlineStartColor: {
      default: colors.border,
      ":first-child": "transparent",
      [breakpoints.lg]: { default: colors.border, ":nth-child(odd)": "transparent" },
    },
    borderInlineStartStyle: "solid",
    borderInlineStartWidth: 1,
    color: "inherit",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    fontFamily: "inherit",
    outlineColor: colors.ring,
    outlineOffset: -2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    transitionDuration: motion.enter,
    transitionProperty: "background-color",
    borderTopColor: {
      default: "transparent",
      [breakpoints.lg]: { default: colors.border, ":nth-child(-n+2)": "transparent" },
    },
    borderTopStyle: "solid",
    borderTopWidth: 1,
    minWidth: 0,
  },
  value: {
    fontFamily: font.mono,
    fontSize: "1.0625rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
  },
  label: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textOverflow: "ellipsis",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  },
})
const compact = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 })

export function ProfileActions({
  profile,
  viewer,
}: {
  profile: UserProfile
  viewer: Session["user"] | null
}) {
  const navigate = routeApi.useNavigate()
  const [followList, setFollowList] = useState<"followers" | "following" | null>(null)
  const [dialog, setDialog] = useState<"edit" | "customize" | null>(null)
  const isOwner = viewer?.id === profile.id
  const openTab = (tab: "uploads" | "comments") => {
    void navigate({ search: { tab }, replace: true, resetScroll: false })
  }

  return (
    <div sx={styles.root}>
      {isOwner ? (
        <div sx={styles.buttons}>
          <Button
            onClick={() => {
              setDialog("edit")
            }}
            variant="outline"
          >
            <Edit />
            {m.profile_edit()}
          </Button>
          <Button
            onClick={() => {
              setDialog("customize")
            }}
          >
            <Sparkles />
            {m.profile_customize()}
          </Button>
        </div>
      ) : null}
      {viewer !== null && !isOwner ? (
        <div sx={styles.buttons}>
          <FollowButton profile={profile} sx={styles.single} />
        </div>
      ) : null}
      <div sx={styles.counts}>
        <button
          onClick={() => {
            setFollowList("followers")
          }}
          sx={styles.count}
          type="button"
        >
          <span sx={styles.value}>{compact.format(profile.followerCount)}</span>
          <span sx={styles.label}>{m.profile_followers_title()}</span>
        </button>
        <button
          onClick={() => {
            setFollowList("following")
          }}
          sx={styles.count}
          type="button"
        >
          <span sx={styles.value}>{compact.format(profile.followingCount)}</span>
          <span sx={styles.label}>{m.profile_following_title()}</span>
        </button>
        <button
          onClick={() => {
            openTab("uploads")
          }}
          sx={styles.count}
          type="button"
        >
          <span sx={styles.value}>{compact.format(profile.uploadCount)}</span>
          <span sx={styles.label}>{m.profile_tab_uploads()}</span>
        </button>
        <button
          onClick={() => {
            openTab("comments")
          }}
          sx={styles.count}
          type="button"
        >
          <span sx={styles.value}>{compact.format(profile.commentCount)}</span>
          <span sx={styles.label}>{m.profile_tab_comments()}</span>
        </button>
      </div>
      <FollowListDialog
        direction={followList}
        onClose={() => {
          setFollowList(null)
        }}
        userId={profile.id}
      />
      {isOwner && dialog !== null ? (
        <Suspense>
          {dialog === "edit" ? (
            <EditProfileDialog
              onClose={() => {
                setDialog(null)
              }}
              profile={profile}
            />
          ) : (
            <CustomizeDialog
              onClose={() => {
                setDialog(null)
              }}
              profile={profile}
            />
          )}
        </Suspense>
      ) : null}
    </div>
  )
}
