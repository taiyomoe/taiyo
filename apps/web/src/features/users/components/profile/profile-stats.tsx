import * as stylex from "@stylexjs/stylex"
import { colors, font, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import type { UserProfile } from "@/features/users/api/profile"
import { FollowListDialog } from "@/features/users/components/profile/dialogs/follow-list-dialog"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    columnGap: "1.25rem",
    display: "flex",
    flexWrap: "wrap",
    rowGap: "0.25rem",
  },
  stat: {
    padding: 0,
    borderStyle: "none",
    gap: "0.3125rem",
    alignItems: "baseline",
    backgroundColor: "transparent",
    color: {
      default: colors.mutedForeground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    cursor: "pointer",
    display: "inline-flex",
    fontFamily: "inherit",
    fontSize: "0.9375rem",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    transitionDuration: motion.enter,
    transitionProperty: "color",
  },
  value: {
    color: colors.foreground,
    fontFamily: font.mono,
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
  },
})
const compact = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 })

export function ProfileStats({ profile }: { profile: UserProfile }) {
  const [followList, setFollowList] = useState<"followers" | "following" | null>(null)
  const stats = [
    {
      value: profile.followerCount,
      label: profile.followerCount === 1 ? m.profile_follower_title() : m.profile_followers_title(),
      onClick: () => {
        setFollowList("followers")
      },
    },
    {
      value: profile.followingCount,
      label: m.profile_following_title(),
      onClick: () => {
        setFollowList("following")
      },
    },
  ]

  return (
    <>
      <ul sx={styles.root}>
        {stats.map(({ value, label, onClick }) => (
          <li key={label}>
            <button onClick={onClick} sx={styles.stat} type="button">
              <span sx={styles.value}>{compact.format(value)}</span>
              {label}
            </button>
          </li>
        ))}
      </ul>
      <FollowListDialog
        direction={followList}
        hiddenFor={profile.followingHidden ? profile.displayUsername : null}
        onClose={() => {
          setFollowList(null)
        }}
        userId={profile.id}
      />
    </>
  )
}
