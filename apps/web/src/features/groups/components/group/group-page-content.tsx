import * as stylex from "@stylexjs/stylex"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import type { Session } from "@/lib/session"
import { groupQueryOptions } from "@/features/groups/api/groups"
import { GroupEmblem } from "@/features/groups/components/group/group-emblem"
import { GroupTabs } from "@/features/groups/components/group/group-tabs"
import { GroupBanner } from "@/features/groups/components/group/profile/group-banner"
import { GroupHeaderActions } from "@/features/groups/components/group/profile/group-header-actions"
import { GroupIdentity } from "@/features/groups/components/group/profile/group-identity"
import { groupProfileStyles } from "@/features/groups/components/group/profile/group-profile-styles"
import { GroupOverview } from "@/features/groups/components/group/tabs/group-overview"
import { useGroupCommands } from "@/features/groups/hooks/use-group-commands"

const styles = stylex.create({
  header: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  top: {
    gap: "1rem",
    alignItems: "flex-start",
    display: "flex",
    justifyContent: "space-between",
  },
  avatar: {
    flexShrink: 0,
    position: "relative",
    zIndex: 1,
    marginTop: { default: "-3rem", [breakpoints.md]: "-4.25rem" },
    width: { default: "5.5rem", [breakpoints.md]: "8rem" },
  },
  actions: {
    paddingTop: "0.875rem",
  },
})

export function GroupPageContent({
  groupId,
  user,
}: {
  groupId: string
  user: Session["user"] | null
}) {
  const { data: group } = useSuspenseQuery(groupQueryOptions(groupId))

  useGroupCommands(group)

  return (
    <div sx={groupProfileStyles.root}>
      <GroupBanner group={group} />
      <div sx={groupProfileStyles.container}>
        <header sx={styles.header}>
          <div sx={styles.top}>
            <div sx={styles.avatar}>
              <GroupEmblem group={group} />
            </div>
            <GroupHeaderActions group={group} sx={styles.actions} user={user} />
          </div>
          <GroupIdentity group={group} />
        </header>
        <GroupTabs group={group} overview={<GroupOverview group={group} />} user={user} />
      </div>
    </div>
  )
}
