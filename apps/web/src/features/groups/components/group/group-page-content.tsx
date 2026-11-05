import * as stylex from "@stylexjs/stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import type { Session } from "@/lib/session"
import { groupQueryOptions } from "@/features/groups/api/groups"
import { GroupActions } from "@/features/groups/components/group/group-actions"
import { GroupBackdrop } from "@/features/groups/components/group/group-backdrop"
import { GroupEmblem } from "@/features/groups/components/group/group-emblem"
import { GroupFacts } from "@/features/groups/components/group/group-facts"
import { GroupHero } from "@/features/groups/components/group/group-hero"
import { GroupLinks } from "@/features/groups/components/group/group-links"
import { groupStyles } from "@/features/groups/components/group/group-styles"
import { GroupTabs } from "@/features/groups/components/group/group-tabs"
import { mediaPageStyles } from "@/features/media/components/media-page/media-page-styles"

const styles = stylex.create({
  root: {
    isolation: "isolate",
    position: "relative",
  },
  actionsSlot: {
    gap: "1.25rem",
    flexDirection: "column",
    gridColumnEnd: "actions",
    gridColumnStart: "actions",
    gridRowEnd: "actions",
    gridRowStart: "actions",
  },
  flex: {
    display: "flex",
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

  return (
    <div sx={styles.root}>
      <GroupBackdrop group={group} />
      <div sx={mediaPageStyles.layout}>
        <aside sx={mediaPageStyles.aside}>
          <div sx={mediaPageStyles.coverSlot}>
            <GroupEmblem group={group} />
          </div>
          <div sx={[styles.actionsSlot, styles.flex]}>
            <GroupActions group={group} user={user} />
            <div sx={[styles.actionsSlot, groupStyles.desktopOnly]}>
              <GroupFacts group={group} />
              <GroupLinks group={group} />
            </div>
          </div>
        </aside>
        <div sx={mediaPageStyles.main}>
          <GroupHero group={group} />
          <GroupTabs group={group} user={user} />
        </div>
      </div>
    </div>
  )
}
