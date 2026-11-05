import * as stylex from "@stylexjs/stylex"
import { Crown } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Suspense } from "react"
import { range } from "remeda"
import { formatNumber } from "@/features/dashboard/lib/format"
import { type GroupMember, groupMembersQueryOptions } from "@/features/groups/api/groups"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { groupStyles } from "@/features/groups/components/group/group-styles"
import { formatMonthYear } from "@/features/groups/lib/group-format"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  section: {
    gap: "0.875rem",
    display: "flex",
    flexDirection: "column",
  },
  grid: {
    margin: 0,
    padding: 0,
    gap: "0.75rem",
    listStyle: "none",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.md]: "repeat(2, minmax(0, 1fr))",
      [breakpoints.xl]: "repeat(3, minmax(0, 1fr))",
    },
  },
  member: {
    gap: "1rem",
    paddingBlock: "1rem",
    paddingInline: "1.25rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  avatar: {
    fontSize: "1.25rem",
    height: "3rem",
    width: "3rem",
  },
  text: {
    gap: "0.3125rem",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  name: {
    gap: "0.375rem",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    fontSize: "1rem",
    fontWeight: 600,
    maxWidth: "100%",
  },
  nameText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  crown: {
    color: colors.warning,
    flexShrink: 0,
  },
  meta: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
  },
  skeleton: {
    borderRadius: radius.xl,
    height: "5.5rem",
  },
})

export function GroupMembers({ groupId }: { groupId: string }) {
  return (
    <Suspense
      fallback={
        <ul aria-hidden sx={styles.grid}>
          {range(0, 6).map((index) => (
            <li key={index}>
              <Skeleton sx={styles.skeleton} />
            </li>
          ))}
        </ul>
      }
    >
      <MemberSections groupId={groupId} />
    </Suspense>
  )
}

function MemberSections({ groupId }: { groupId: string }) {
  const { data: members } = useSuspenseQuery(groupMembersQueryOptions(groupId))
  const sections = [
    { title: m.group_members_leadership(), members: members.filter((x) => x.role === "OWNER") },
    { title: m.group_members_team(), members: members.filter((x) => x.role === "MEMBER") },
  ].filter((section) => section.members.length > 0)

  if (sections.length === 0) {
    return <p sx={groupStyles.muted}>{m.group_members_empty()}</p>
  }

  return (
    <div sx={groupStyles.panel}>
      {sections.map((section) => (
        <section key={section.title} sx={styles.section}>
          <h3 sx={groupStyles.heading}>
            {section.title}
            <span sx={groupStyles.headingCount}>{section.members.length}</span>
          </h3>
          <ul sx={styles.grid}>
            {section.members.map((member) => (
              <MemberCard key={member.userId} member={member} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function MemberCard({ member }: { member: GroupMember }) {
  const owner = member.role === "OWNER"

  return (
    <li sx={[groupStyles.card, styles.member]}>
      <PersonAvatar
        person={{ id: member.userId, displayUsername: member.displayUsername, image: member.image }}
        sx={styles.avatar}
      />
      <div sx={styles.text}>
        <span sx={styles.name}>
          <span sx={styles.nameText}>{member.displayUsername}</span>
          {owner ? (
            <Crown aria-label={m.group_role_owner()} size={16} {...stylex.props(styles.crown)} />
          ) : null}
        </span>
        <Badge variant={owner ? "warning" : "outline"}>
          {owner ? m.group_leader() : m.group_role_member()}
        </Badge>
        <span sx={styles.meta}>
          {m.group_member_meta({
            date: formatMonthYear(member.createdAt),
            count: formatNumber(member.chapterCount),
          })}
        </span>
      </div>
    </li>
  )
}
