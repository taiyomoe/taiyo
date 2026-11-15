import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import type { UserEntity } from "@/features/command-palette/lib/palette-command"
import { UserName } from "@/components/user-name/user-name"
import { previewStyles } from "@/features/command-palette/components/preview/preview-styles"
import { GroupAvatar, PersonAvatar } from "@/features/groups/components/group-avatar"
import { userProfileQueryOptions } from "@/features/users/api/profile"
import { ROLE_LABELS } from "@/features/users/lib/role-labels"
import { pickLocalized } from "@/lib/locale"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const MAX_GROUPS = 5
const styles = stylex.create({
  banner: {
    borderRadius: `calc(${radius.xl} - 0.5rem - 1px)`,
    aspectRatio: "3 / 1",
    backgroundColor: colors.well,
    display: "block",
    objectFit: "cover",
    width: "100%",
  },
  avatar: {
    flexShrink: 0,
    height: "3.5rem",
    width: "3.5rem",
  },
  avatarFallback: {
    fontSize: "1.25rem",
  },
  role: {
    alignSelf: "flex-start",
  },
  counts: {
    gap: "1rem",
    display: "flex",
    fontSize: "0.8125rem",
  },
  count: {
    color: colors.foreground,
    fontWeight: 600,
  },
  groups: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  group: {
    gap: "0.625rem",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    fontSize: "0.8125rem",
    minWidth: 0,
  },
  groupLogo: {
    borderRadius: radius.sm,
    flexShrink: 0,
    fontSize: "0.625rem",
    height: "1.5rem",
    width: "1.5rem",
  },
  groupName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})

export function UserPreview({ user }: { user: UserEntity }) {
  const { data: profile } = useQuery({
    ...userProfileQueryOptions(user.username),
    staleTime: 60_000,
  })
  const about = profile === undefined ? undefined : pickLocalized(profile.about)
  const joined =
    profile === undefined
      ? null
      : new Intl.DateTimeFormat(getLocale(), { month: "long", year: "numeric" }).format(
          new Date(profile.createdAt),
        )

  return (
    <div sx={previewStyles.root}>
      {profile?.bannerUrl === null || profile?.bannerUrl === undefined ? null : (
        <img alt="" src={profile.bannerUrl} sx={styles.banner} />
      )}
      <div sx={previewStyles.header}>
        <PersonAvatar fallbackSx={styles.avatarFallback} person={user} sx={styles.avatar} />
        <div sx={previewStyles.headerText}>
          <span sx={previewStyles.heading}>
            <UserName effect={profile?.nameEffect ?? user.nameEffect} name={user.displayUsername} />
          </span>
          <span sx={previewStyles.subtle}>@{user.username}</span>
          {profile === undefined || profile.role === "USER" ? null : (
            <Badge size="sm" sx={styles.role} variant="outline">
              {ROLE_LABELS[profile.role]()}
            </Badge>
          )}
        </div>
      </div>
      {profile === undefined ? (
        <div sx={previewStyles.section}>
          <Skeleton sx={previewStyles.line} />
          <Skeleton sx={[previewStyles.line, previewStyles.lineShort]} />
        </div>
      ) : (
        <>
          <div sx={[previewStyles.subtle, styles.counts]}>
            <span>
              <span sx={styles.count}>{profile.followerCount}</span>{" "}
              {profile.followerCount === 1 ? m.profile_follower() : m.profile_followers()}
            </span>
            <span>
              <span sx={styles.count}>{profile.followingCount}</span> {m.profile_following()}
            </span>
          </div>
          {about === undefined || about === "" ? null : <p sx={previewStyles.body}>{about}</p>}
          {profile.groups.length === 0 ? null : (
            <div sx={previewStyles.section}>
              <span sx={previewStyles.label}>{m.profile_groups()}</span>
              <div sx={styles.groups}>
                {profile.groups.slice(0, MAX_GROUPS).map((group) => (
                  <div key={group.id} sx={styles.group}>
                    <GroupAvatar
                      id={group.id}
                      logoUrl={group.logoUrl}
                      name={group.name}
                      sx={styles.groupLogo}
                    />
                    <span sx={styles.groupName}>{group.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {joined === null ? null : (
            <span sx={previewStyles.subtle}>{m.profile_joined({ date: joined })}</span>
          )}
        </>
      )}
    </div>
  )
}
