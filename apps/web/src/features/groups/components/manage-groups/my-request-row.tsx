import * as stylex from "@stylexjs/stylex"
import { Badge, type BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { MyOwnershipRequest } from "@/features/groups/api/groups"
import { ListRow } from "@/components/layout/dashboard-page"
import { TimeAgo } from "@/components/time/time-ago"
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import { manageGroupsStyles } from "@/features/groups/components/manage-groups/manage-groups-styles"
import { m } from "@/paraglide/messages"

const REQUEST_STATUS: Record<
  MyOwnershipRequest["status"],
  { label: () => string; variant: BadgeVariant }
> = {
  PENDING: { label: m.request_status_pending, variant: "warning" },
  APPROVED: { label: m.request_status_approved, variant: "success" },
  REJECTED: { label: m.request_status_rejected, variant: "error" },
  CANCELLED: { label: m.request_status_cancelled, variant: "outline" },
}
const styles = stylex.create({
  note: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    fontStyle: "italic",
    overflowWrap: "anywhere",
  },
})

type MyRequestRowProps = {
  row: {
    kind: "claim" | "creation"
    id: string
    name: string
    groupId: string | null
    status: MyOwnershipRequest["status"]
    note: string | null
    createdAt: string
  }
  cancelling: boolean
  onCancel: () => void
}

export function MyRequestRow({ row, cancelling, onCancel }: MyRequestRowProps) {
  return (
    <ListRow>
      <GroupAvatar id={row.groupId ?? row.id} name={row.name} />
      <div sx={manageGroupsStyles.main}>
        <div sx={manageGroupsStyles.titleLine}>
          {row.groupId === null ? (
            <span sx={manageGroupsStyles.name}>{row.name}</span>
          ) : (
            <Link
              params={{ groupId: row.groupId }}
              {...stylex.props(manageGroupsStyles.name)}
              to="/groups/$groupId"
            >
              {row.name}
            </Link>
          )}
          <Badge variant={REQUEST_STATUS[row.status].variant}>
            {REQUEST_STATUS[row.status].label()}
          </Badge>
        </div>
        <div sx={manageGroupsStyles.meta}>
          <span>{row.kind === "claim" ? m.my_requests_claim() : m.my_requests_new_group()}</span>
          <span aria-hidden>·</span>
          <TimeAgo date={row.createdAt} />
        </div>
        {row.note === null ? null : (
          <span sx={styles.note}>{m.request_review_note({ note: row.note })}</span>
        )}
      </div>
      {row.status === "PENDING" ? (
        <div sx={manageGroupsStyles.actions}>
          <Button disabled={cancelling} onClick={onCancel} size="sm" variant="ghost">
            {m.request_cancel()}
          </Button>
        </div>
      ) : null}
    </ListRow>
  )
}
