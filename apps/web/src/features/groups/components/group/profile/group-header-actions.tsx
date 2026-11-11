import type { Sx } from "@taiyomoe/ui/styles/sx"
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
  root: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
})

export function GroupHeaderActions({
  group,
  user,
  sx,
}: {
  group: Group
  user: Session["user"] | null
  sx?: Sx
}) {
  const can = usePermissions(user)
  const canManage =
    can("group.manageMembers", { id: group.id }) || can("group.update", { id: group.id })

  return (
    <div sx={[styles.root, sx]}>
      {canManage ? (
        <Button
          aria-label={m.group_manage()}
          render={<Link params={{ groupId: group.id }} to="/dashboard/groups/$groupId" />}
          size="icon"
          title={m.group_manage()}
          variant="outline"
        >
          <Settings />
        </Button>
      ) : null}
      {group.owned ? null : <ClaimAction group={group} user={user} />}
      <ReportGroupDialog group={group} iconOnly signedIn={user !== null} />
      <ShareGroupButton group={group} size="icon" />
      <FollowGroupButton compact group={group} signedIn={user !== null} />
    </div>
  )
}
