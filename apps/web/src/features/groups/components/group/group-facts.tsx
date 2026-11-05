import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement, ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Book, Bookmark, Clock, Library, Users } from "@taiyomoe/ui/components/icons"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { Group } from "@/features/groups/api/groups"
import { TimeAgo } from "@/components/time/time-ago"
import { formatNumber } from "@/features/dashboard/lib/format"
import { groupStyles } from "@/features/groups/components/group/group-styles"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  list: {
    margin: 0,
    paddingBlock: "0.25rem",
    paddingInline: "1.25rem",
  },
  row: {
    gap: "0.625rem",
    paddingBlock: "0.75rem",
    alignItems: "center",
    display: "flex",
    borderBottomColor: { default: colors.border, ":last-child": "transparent" },
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
  term: {
    gap: "0.625rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexGrow: 1,
    fontSize: "0.875rem",
  },
  value: {
    margin: 0,
    color: colors.foreground,
    fontFamily: font.mono,
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
  },
  time: {
    color: colors.foreground,
    fontFamily: font.mono,
    fontSize: "0.875rem",
    fontWeight: 600,
  },
})

export function GroupFacts({ group }: { group: Group }) {
  return (
    <dl sx={[groupStyles.card, styles.list]}>
      <Fact icon={Book} term={m.group_stat_chapters()}>
        {formatNumber(group.chapterCount)}
      </Fact>
      <Fact icon={Library} term={m.group_stat_titles()}>
        {formatNumber(group.mediaCount)}
      </Fact>
      <Fact icon={Users} term={m.group_stat_members()}>
        {formatNumber(group.memberCount)}
      </Fact>
      <Fact icon={Bookmark} term={m.group_stat_followers()}>
        {formatNumber(group.followerCount)}
      </Fact>
      <Fact icon={Clock} term={m.group_stat_last_upload()}>
        {group.lastUploadAt === null ? "—" : <TimeAgo date={group.lastUploadAt} sx={styles.time} />}
      </Fact>
    </dl>
  )
}

function Fact({
  icon: Icon,
  term,
  children,
}: {
  icon: (props: IconProps) => ReactElement
  term: string
  children: ReactNode
}) {
  return (
    <div sx={styles.row}>
      <dt sx={styles.term}>
        <Icon size={16} />
        {term}
      </dt>
      <dd sx={styles.value}>{children}</dd>
    </div>
  )
}
