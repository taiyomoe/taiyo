import * as stylex from "@stylexjs/stylex"
import { Calendar, CheckCircle, Clock, Globe } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { breakpoints, colors, font, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { Group } from "@/features/groups/api/groups"
import type { GroupTab } from "@/features/groups/lib/group-page"
import { getLanguageCode } from "@/components/flags/language-flags"
import { sceneFont } from "@/components/scene/scene.stylex"
import { TimeAgo } from "@/components/time/time-ago"
import { formatCompact } from "@/features/dashboard/lib/format"
import { formatMonthYear } from "@/features/groups/lib/group-format"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  identity: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  nameRow: {
    alignItems: "center",
    columnGap: "0.75rem",
    display: "flex",
    flexWrap: "wrap",
    rowGap: "0.5rem",
  },
  name: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: { default: "1.75rem", [breakpoints.md]: "2.25rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    overflowWrap: "anywhere",
  },
  badges: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  mono: {
    fontFamily: font.mono,
  },
  handle: {
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
    marginTop: "-0.25rem",
  },
  meta: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    alignItems: "center",
    color: colors.mutedForeground,
    columnGap: "1.25rem",
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.9375rem",
    rowGap: "0.375rem",
  },
  metaItem: {
    gap: "0.375rem",
    alignItems: "center",
    display: "inline-flex",
    minWidth: 0,
  },
  metaLink: {
    textDecoration: { default: "none", ":hover": "underline" },
    color: "inherit",
    overflowWrap: "anywhere",
  },
  stats: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    columnGap: "1.25rem",
    display: "flex",
    flexWrap: "wrap",
    rowGap: "0.25rem",
  },
  stat: {
    gap: "0.3125rem",
    textDecoration: "none",
    alignItems: "baseline",
    color: {
      default: colors.mutedForeground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    display: "inline-flex",
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
const toDisplay = (href: string) => href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")

export function GroupIdentity({ group }: { group: Group }) {
  const website =
    group.website !== null && /^https?:\/\//.test(group.website) ? group.website : null

  return (
    <div sx={styles.identity}>
      <div sx={styles.nameRow}>
        <h1 sx={styles.name}>{group.name}</h1>
        <div sx={styles.badges}>
          {group.owned ? (
            <Badge variant="warning">
              <CheckCircle />
              {m.group_verified()}
            </Badge>
          ) : (
            <Badge variant="outline">{m.groups_unclaimed()}</Badge>
          )}
          {group.languages.map((language) => (
            <Badge key={language} sx={styles.mono} variant="secondary">
              {getLanguageCode(language)}
            </Badge>
          ))}
        </div>
      </div>
      <span sx={styles.handle}>{m.group_kind()}</span>
      <ul sx={styles.meta}>
        <li sx={styles.metaItem}>
          <Calendar size={16} />
          {m.group_since({ date: formatMonthYear(group.createdAt) })}
        </li>
        {group.lastUploadAt === null ? null : (
          <li sx={styles.metaItem}>
            <Clock size={16} />
            <span>
              {m.group_last_upload_prefix()} <TimeAgo date={group.lastUploadAt} />
            </span>
          </li>
        )}
        {website === null ? null : (
          <li sx={styles.metaItem}>
            <Globe size={16} />
            <a
              href={website}
              rel="noopener noreferrer nofollow"
              sx={styles.metaLink}
              target="_blank"
            >
              {toDisplay(website)}
            </a>
          </li>
        )}
      </ul>
      <GroupInlineStats group={group} />
    </div>
  )
}

function GroupInlineStats({ group }: { group: Group }) {
  const stats: Array<{ value: number; label: string; tab?: GroupTab }> = [
    {
      value: group.followerCount,
      label: group.followerCount === 1 ? m.group_hero_followers_one() : m.group_hero_followers(),
    },
    {
      value: group.memberCount,
      label: group.memberCount === 1 ? m.group_inline_member() : m.group_inline_members(),
      tab: "members",
    },
    {
      value: group.chapterCount,
      label: group.chapterCount === 1 ? m.group_hero_chapters_one() : m.group_hero_chapters(),
      tab: "chapters",
    },
    {
      value: group.mediaCount,
      label: group.mediaCount === 1 ? m.group_inline_title() : m.group_inline_titles(),
      tab: "titles",
    },
  ]

  return (
    <ul sx={styles.stats}>
      {stats.map(({ value, label, tab }) => (
        <li key={label}>
          {tab === undefined ? (
            <span sx={styles.stat}>
              <span sx={styles.value}>{formatCompact(value)}</span>
              {label}
            </span>
          ) : (
            <Link
              params={{ groupId: group.id }}
              resetScroll={false}
              search={{ tab }}
              to="/groups/$groupId"
              {...stylex.props(styles.stat)}
            >
              <span sx={styles.value}>{formatCompact(value)}</span>
              {label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  )
}
