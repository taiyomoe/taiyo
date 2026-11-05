import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Calendar, Copy, Check, Users } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { Group } from "@/features/groups/api/groups"
import { getLanguageCode } from "@/components/flags/flags"
import { TimeAgo } from "@/components/time/time-ago"
import { formatNumber } from "@/features/dashboard/lib/format"
import { GroupFacts } from "@/features/groups/components/group/group-facts"
import { GroupLinks } from "@/features/groups/components/group/group-links"
import { groupStyles } from "@/features/groups/components/group/group-styles"
import { GroupLeaders } from "@/features/groups/components/group/tabs/group-leaders"
import { LatestReleases } from "@/features/groups/components/group/tabs/latest-releases"
import { formatMonthYear } from "@/features/groups/lib/group-format"
import { useCopy } from "@/hooks/use-copy"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  description: {
    gap: "0.875rem",
    display: "flex",
    flexDirection: "column",
  },
  paragraph: {
    margin: 0,
    color: colors.foreground,
    fontSize: "1.0625rem",
    lineHeight: 1.65,
    overflowWrap: "anywhere",
  },
  details: {
    margin: 0,
    columnGap: { default: "1.25rem", [breakpoints.sm]: "2.5rem" },
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [breakpoints.xl]: "repeat(3, minmax(0, 1fr))",
    },
  },
  detail: {
    gap: "0.5rem",
    paddingBlock: "1rem",
    display: "flex",
    flexDirection: "column",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    minWidth: 0,
  },
  value: {
    margin: 0,
    gap: "0.5rem",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "1rem",
    fontWeight: 500,
    minHeight: "2rem",
    minWidth: 0,
  },
  valueIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  language: {
    fontFamily: font.mono,
  },
  idValue: {
    flexWrap: "nowrap",
  },
  wide: {
    gridColumn: { default: "1 / -1", [breakpoints.xl]: "auto" },
  },
  id: {
    overflow: "hidden",
    flexGrow: 1,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  time: {
    color: colors.foreground,
    fontSize: "1rem",
  },
  aside: {
    gap: "1.25rem",
    flexDirection: "column",
  },
})

export function GroupInfo({ group }: { group: Group }) {
  const paragraphs = (group.description ?? "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== "")

  return (
    <div sx={groupStyles.panel}>
      {paragraphs.length === 0 ? (
        <p sx={groupStyles.muted}>{m.group_no_description()}</p>
      ) : (
        <div sx={styles.description}>
          {paragraphs.map((paragraph, index) => (
            // oxlint-disable-next-line react/no-array-index-key
            <p key={index} sx={styles.paragraph}>
              {paragraph}
            </p>
          ))}
        </div>
      )}
      <GroupLeaders groupId={group.id} />
      <dl sx={styles.details}>
        <Detail term={m.group_detail_founded()}>
          <Calendar size={18} {...stylex.props(styles.valueIcon)} />
          {formatMonthYear(group.createdAt)}
        </Detail>
        <Detail term={m.group_detail_members()}>
          <Users size={18} {...stylex.props(styles.valueIcon)} />
          {formatNumber(group.memberCount)}
        </Detail>
        <Detail term={m.group_detail_languages()}>
          {group.languages.length === 0
            ? "—"
            : group.languages.map((language) => (
                <Badge key={language} sx={styles.language} variant="info">
                  {getLanguageCode(language)}
                </Badge>
              ))}
        </Detail>
        <Detail term={m.group_detail_titles()}>{formatNumber(group.mediaCount)}</Detail>
        <Detail term={m.group_detail_last_upload()}>
          {group.lastUploadAt === null ? (
            "—"
          ) : (
            <TimeAgo date={group.lastUploadAt} sx={styles.time} />
          )}
        </Detail>
        <Detail nowrap term={m.group_detail_id()}>
          <span sx={styles.id} title={group.id}>
            {group.id}
          </span>
          <CopyButton value={group.id} />
        </Detail>
      </dl>
      <LatestReleases groupId={group.id} />
      <div sx={[styles.aside, groupStyles.mobileOnly]}>
        <GroupFacts group={group} />
        <GroupLinks group={group} />
      </div>
    </div>
  )
}

function Detail({
  term,
  children,
  nowrap = false,
}: {
  term: string
  children: ReactNode
  nowrap?: boolean
}) {
  return (
    <div sx={[styles.detail, nowrap && styles.wide]}>
      <dt sx={groupStyles.label}>{term}</dt>
      <dd sx={[styles.value, nowrap && styles.idValue]}>{children}</dd>
    </div>
  )
}

function CopyButton({ value }: { value: string }) {
  const { copied, copy } = useCopy()
  const label = copied ? m.group_id_copied() : m.group_id_copy()

  return (
    <Button
      aria-label={label}
      onClick={() => {
        copy(value)
      }}
      size="icon-sm"
      title={label}
      variant="ghost"
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  )
}
