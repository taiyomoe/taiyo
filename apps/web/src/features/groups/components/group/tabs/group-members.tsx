import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Suspense } from "react"
import { range } from "remeda"
import { formatNumber } from "@/features/dashboard/lib/format"
import { groupMembersQueryOptions } from "@/features/groups/api/groups"
import { GroupPeopleRow } from "@/features/groups/components/group/profile/group-people-row"
import { groupProfileStyles } from "@/features/groups/components/group/profile/group-profile-styles"
import { formatMonthYear } from "@/features/groups/lib/group-format"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  grid: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    columnGap: "1.5rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.md]: {
        default: "repeat(2, minmax(0, 1fr))",
        [breakpoints.xl]: "repeat(3, minmax(0, 1fr))",
      },
    },
    rowGap: "0.25rem",
  },
  skeleton: {
    borderRadius: radius.lg,
    height: "3.75rem",
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
    return <p sx={groupProfileStyles.empty}>{m.group_members_empty()}</p>
  }

  return (
    <div sx={groupProfileStyles.column}>
      {sections.map((section, index) => (
        <section
          key={section.title}
          sx={[groupProfileStyles.section, index === 0 && groupProfileStyles.flush]}
        >
          <h2 sx={groupProfileStyles.sectionTitle}>
            {section.title}
            <span sx={groupProfileStyles.count}>{section.members.length}</span>
          </h2>
          <ul sx={styles.grid}>
            {section.members.map((member) => (
              <li key={member.userId}>
                <GroupPeopleRow
                  member={member}
                  meta={m.group_member_meta({
                    date: formatMonthYear(member.createdAt),
                    count: formatNumber(member.chapterCount),
                  })}
                  trailing={
                    member.role === "OWNER" ? (
                      <Badge variant="warning">{m.group_role_owner()}</Badge>
                    ) : null
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
