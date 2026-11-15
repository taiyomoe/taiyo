import * as stylex from "@stylexjs/stylex"
import { getLevelProgress } from "@taiyomoe/db/levels"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useRouteContext } from "@tanstack/react-router"
import { AvatarBorder } from "@/components/avatar-border/avatar-border"
import { UserName } from "@/components/user-name/user-name"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { userProfileQueryOptions } from "@/features/users/api/profile"
import { UserHoverCardSkeleton } from "@/features/users/components/hover-card/user-hover-card-skeleton"
import { hoverCardStyles } from "@/features/users/components/hover-card/user-hover-card-styles"
import { FollowButton } from "@/features/users/components/profile/follow-button"
import { TitleBadge } from "@/features/users/components/profile/title-badge"
import { READER_RANK_LABELS } from "@/features/users/lib/level-labels"
import { ROLE_LABELS } from "@/features/users/lib/role-labels"
import { pickLocalized } from "@/lib/locale"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const TONES = ["#f59e0b", "#f43f5e", "#8b5cf6", "#0ea5e9", "#10b981"]
const styles = stylex.create({
  image: {
    display: "block",
    objectFit: "cover",
    height: "100%",
    width: "100%",
  },
  fill: {
    inset: 0,
    position: "absolute",
  },
  fallback: {
    fontSize: "1.5rem",
  },
  follow: {
    marginBottom: "0.125rem",
  },
  identity: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  name: {
    fontSize: "1.0625rem",
    fontWeight: font.weightBold,
    lineHeight: 1.3,
    overflowWrap: "anywhere",
  },
  handle: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
  badges: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  about: {
    margin: 0,
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 3,
    color: `color-mix(in srgb, ${colors.foreground} 85%, transparent)`,
    display: "-webkit-box",
    fontSize: "0.8125rem",
    lineHeight: 1.45,
    whiteSpace: "pre-line",
  },
  counts: {
    color: colors.mutedForeground,
    columnGap: "0.875rem",
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.8125rem",
    rowGap: "0.25rem",
  },
  count: {
    color: colors.foreground,
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
  },
  unavailable: {
    padding: "1rem",
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
})

/** The preview shown when hovering a user's name anywhere on the site. */
export function UserHoverCard({ username }: { username: string }) {
  const { session } = useRouteContext({ from: "__root__" })
  // Shares the profile page's cache: hovering a name warms the page it links to.
  const { data: profile, isError } = useQuery({
    ...userProfileQueryOptions(username),
    staleTime: 60_000,
  })

  if (isError) {
    return <p sx={styles.unavailable}>{m.user_card_unavailable()}</p>
  }

  if (profile === undefined) {
    return <UserHoverCardSkeleton />
  }

  const locale = getLocale()
  const about = pickLocalized(profile.about)
  const numbers = new Intl.NumberFormat(locale, { notation: "compact" })
  const joined = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    new Date(profile.createdAt),
  )
  const first = Number.parseInt(profile.id.slice(0, 2), 16) % TONES.length
  const second = (first + 2) % TONES.length
  const canFollow = session !== null && session.user.id !== profile.id
  const level = getLevelProgress(profile.xp)
  const counts = [
    {
      key: "followers",
      value: profile.followerCount,
      label: profile.followerCount === 1 ? m.profile_follower() : m.profile_followers(),
    },
    ...(profile.followingHidden
      ? []
      : [{ key: "following", value: profile.followingCount, label: m.profile_following() }]),
    {
      key: "uploads",
      value: profile.uploadCount,
      label: profile.uploadCount === 1 ? m.user_card_upload() : m.user_card_uploads(),
    },
  ]

  return (
    <>
      <div sx={hoverCardStyles.banner}>
        {profile.bannerUrl === null ? (
          <div
            style={{
              backgroundImage: `radial-gradient(120% 140% at 15% 0%, ${TONES[first]}55, transparent 60%), radial-gradient(120% 140% at 90% 100%, ${TONES[second]}55, transparent 60%)`,
            }}
            sx={styles.fill}
          />
        ) : (
          <img alt="" decoding="async" src={profile.bannerUrl} sx={styles.image} />
        )}
      </div>
      <div sx={hoverCardStyles.body}>
        <div sx={hoverCardStyles.avatarRow}>
          <AvatarBorder border={profile.avatarBorder}>
            <PersonAvatar
              fallbackSx={styles.fallback}
              person={profile}
              sx={hoverCardStyles.avatar}
            />
          </AvatarBorder>
          {canFollow ? <FollowButton profile={profile} size="sm" sx={styles.follow} /> : null}
        </div>
        <div sx={styles.identity}>
          <span sx={styles.name}>
            <UserName effect={profile.nameEffect} name={profile.displayUsername} />
          </span>
          <span sx={styles.handle}>@{profile.username}</span>
        </div>
        <div sx={styles.badges}>
          <Badge size="sm" variant="secondary">
            {m.user_card_level({
              level: String(level.level),
              rank: READER_RANK_LABELS[level.rank](),
            })}
          </Badge>
          <TitleBadge size="sm" title={profile.title} />
          {profile.role === "USER" ? null : (
            <Badge size="sm" variant="outline">
              {ROLE_LABELS[profile.role]()}
            </Badge>
          )}
          {profile.followsViewer === true ? (
            <Badge size="sm" variant="secondary">
              {m.profile_follows_you()}
            </Badge>
          ) : null}
        </div>
        {about === undefined || about === "" ? null : <p sx={styles.about}>{about}</p>}
        <div sx={styles.counts}>
          {counts.map((count) => (
            <span key={count.key}>
              <span sx={styles.count}>{numbers.format(count.value)}</span> {count.label}
            </span>
          ))}
        </div>
        <span sx={styles.handle}>{m.profile_joined({ date: joined })}</span>
      </div>
    </>
  )
}
