import * as stylex from "@stylexjs/stylex"
import { Settings } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Link } from "@tanstack/react-router"
import type { Group } from "@/features/groups/api/groups"
import type { Session } from "@/lib/session"
import { ClaimAction } from "@/features/groups/components/group/claim-action"
import { FollowGroupButton } from "@/features/groups/components/group/follow-group-button"
import { ReportGroupDialog } from "@/features/groups/components/group/report-group-dialog"
import { ShareGroupButton } from "@/features/groups/components/group/share-group-button"
import { usePermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  actions: {
    gap: "0.625rem",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    gap: "0.625rem",
    display: "flex",
  },
  grow: {
    flexGrow: 1,
  },
  full: {
    width: "100%",
  },
})

export function GroupActions({ group, user }: { group: Group; user: Session["user"] | null }) {
  const can = usePermissions(user)
  const canManage =
    can("group.manageMembers", { id: group.id }) || can("group.update", { id: group.id })

  return (
    <div sx={styles.actions}>
      <FollowGroupButton group={group} signedIn={user !== null} />
      <div sx={styles.row}>
        <ReportGroupDialog group={group} signedIn={user !== null} sx={styles.grow} />
        <ShareGroupButton group={group} />
      </div>
      {group.owned ? null : <ClaimAction group={group} sx={styles.full} user={user} />}
      {canManage ? (
        <Button
          render={<Link params={{ groupId: group.id }} to="/dashboard/groups/$groupId" />}
          sx={styles.full}
          variant="ghost"
        >
          <Settings />
          {m.group_manage()}
        </Button>
      ) : null}
    </div>
  )
}
