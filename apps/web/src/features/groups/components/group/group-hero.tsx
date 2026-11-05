import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Bookmark, CheckCircle, Comment, Upload } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { Group } from "@/features/groups/api/groups"
import { getLanguageCode } from "@/components/flags/flags"
import { sceneFont } from "@/components/scene/scene.stylex"
import { formatCompact } from "@/features/dashboard/lib/format"
import { formatMonthYear } from "@/features/groups/lib/group-format"
import { mediaPageStyles } from "@/features/media/components/media-page/media-page-styles"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  eyebrow: {
    margin: 0,
    overflow: "hidden",
    color: `color-mix(in srgb, ${colors.foreground} 75%, transparent)`,
    display: { default: "none", [breakpoints.sm]: "block" },
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textOverflow: "ellipsis",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  name: {
    margin: 0,
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 3,
    color: colors.foreground,
    display: "-webkit-box",
    fontFamily: sceneFont.display,
    fontSize: { default: "1.625rem", [breakpoints.sm]: "2.25rem", [breakpoints.lg]: "3.25rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    overflowWrap: "anywhere",
  },
  badges: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  mono: {
    fontFamily: font.mono,
    textTransform: "uppercase",
  },
  stat: {
    display: { default: "none", [breakpoints.sm]: "inline-flex" },
  },
  statValue: {
    fontFamily: font.mono,
    fontWeight: 600,
  },
})

export function GroupHero({ group }: { group: Group }) {
  return (
    <header sx={mediaPageStyles.header}>
      <p sx={styles.eyebrow}>{m.group_eyebrow({ date: formatMonthYear(group.createdAt) })}</p>
      <h1 sx={styles.name} title={group.name}>
        {group.name}
      </h1>
      <div sx={styles.badges}>
        {group.owned ? (
          <Badge size="lg" variant="warning">
            <CheckCircle />
            {m.group_verified()}
          </Badge>
        ) : (
          <Badge size="lg" variant="outline">
            {m.groups_unclaimed()}
          </Badge>
        )}
        {group.languages.map((language) => (
          <Badge key={language} size="lg" sx={styles.mono} variant="secondary">
            {getLanguageCode(language)}
          </Badge>
        ))}
        <HeroStat
          icon={<Upload />}
          label={m.group_hero_chapters}
          labelOne={m.group_hero_chapters_one}
          value={group.chapterCount}
        />
        <HeroStat
          icon={<Bookmark />}
          label={m.group_hero_followers}
          labelOne={m.group_hero_followers_one}
          value={group.followerCount}
        />
        <HeroStat
          icon={<Comment />}
          label={m.group_hero_comments}
          labelOne={m.group_hero_comments_one}
          value={group.commentCount}
        />
      </div>
    </header>
  )
}

function HeroStat({
  icon,
  label,
  labelOne,
  value,
}: {
  icon: ReactNode
  label: () => string
  labelOne: () => string
  value: number
}) {
  return (
    <Badge size="lg" sx={styles.stat} variant="outline">
      {icon}
      <span sx={styles.statValue}>{formatCompact(value)}</span>
      {value === 1 ? labelOne() : label()}
    </Badge>
  )
}
