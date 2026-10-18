import * as stylex from "@stylexjs/stylex"
import { Plus, Search, Users } from "@taiyomoe/ui/components/icons"
import { Badge, type BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { TimeAgo } from "@/components/chapters/chapter-meta"
import {
  DashboardPage,
  DashboardSection,
  ListCard,
  ListRow,
} from "@/components/dashboard/dashboard-page"
import { GroupAvatar } from "@/components/groups/group-avatar"
import { MemberPermissions, RoleBadge } from "@/components/groups/group-permissions"
import { RequestGroupDialog } from "@/components/groups/request-group-dialog"
import {
  type MyOwnershipRequest,
  myGroupCreationRequestsQueryOptions,
  myGroupsQueryOptions,
  myOwnershipRequestsQueryOptions,
  useCancelGroupCreationRequest,
  useCancelOwnershipRequest,
} from "@/lib/queries/groups"
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
  main: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  titleLine: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  name: {
    textDecoration: "none",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  meta: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
  },
  note: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    fontStyle: "italic",
    overflowWrap: "anywhere",
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    flexShrink: 0,
  },
})

export function MyGroupsPage() {
  return (
    <DashboardPage
      actions={
        <>
          <Button render={<Link to="/groups" />} variant="outline">
            <Search />
            {m.my_groups_find()}
          </Button>
          <RequestGroupDialog
            trigger={
              <Button>
                <Plus />
                {m.request_group_title()}
              </Button>
            }
          />
        </>
      }
      subtitle={m.my_groups_subtitle()}
      title={m.my_groups_title()}
    >
      <MyGroups />
      <MyRequests />
    </DashboardPage>
  )
}

function MyGroups() {
  const { data: groups } = useSuspenseQuery(myGroupsQueryOptions)

  return (
    <DashboardSection title={m.my_groups_section()}>
      {groups.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>{m.my_groups_empty_title()}</EmptyTitle>
            <EmptyDescription>{m.my_groups_empty_description()}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link to="/groups" />} variant="outline">
              {m.my_groups_find()}
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <ListCard>
          {groups.map(({ group, role, permissions, memberCount }) => (
            <ListRow key={group.id}>
              <GroupAvatar id={group.id} name={group.name} />
              <div sx={styles.main}>
                <div sx={styles.titleLine}>
                  <Link
                    params={{ groupId: group.id }}
                    {...stylex.props(styles.name)}
                    to="/groups/$groupId"
                  >
                    {group.name}
                  </Link>
                  <RoleBadge role={role} />
                </div>
                <div sx={styles.meta}>
                  <span>
                    {memberCount === 1
                      ? m.my_groups_member()
                      : m.my_groups_members({ count: memberCount })}
                  </span>
                </div>
                <MemberPermissions permissions={permissions} role={role} showOwner />
              </div>
              <div sx={styles.actions}>
                <Button
                  render={<Link params={{ groupId: group.id }} to="/dashboard/groups/$groupId" />}
                  size="sm"
                  variant="outline"
                >
                  {m.my_groups_manage()}
                </Button>
              </div>
            </ListRow>
          ))}
        </ListCard>
      )}
    </DashboardSection>
  )
}

function MyRequests() {
  const { data: claims } = useSuspenseQuery(myOwnershipRequestsQueryOptions)
  const { data: creations } = useSuspenseQuery(myGroupCreationRequestsQueryOptions)
  const cancelClaim = useCancelOwnershipRequest()
  const cancelCreation = useCancelGroupCreationRequest()
  const rows = [
    ...claims.map((claim) => ({
      id: claim.id,
      kind: "claim" as const,
      name: claim.group.name,
      groupId: claim.groupId,
      status: claim.status,
      note: claim.reviewerNote,
      createdAt: claim.createdAt,
    })),
    ...creations.map((creation) => ({
      id: creation.id,
      kind: "creation" as const,
      name: creation.name,
      groupId: creation.groupId,
      status: creation.status,
      note: creation.reviewerNote,
      createdAt: creation.createdAt,
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  if (rows.length === 0) {
    return null
  }

  return (
    <DashboardSection title={m.my_requests_section()}>
      <ListCard>
        {rows.map((row) => (
          <ListRow key={row.id}>
            <GroupAvatar id={row.groupId ?? row.id} name={row.name} />
            <div sx={styles.main}>
              <div sx={styles.titleLine}>
                {row.groupId === null ? (
                  <span sx={styles.name}>{row.name}</span>
                ) : (
                  <Link
                    params={{ groupId: row.groupId }}
                    {...stylex.props(styles.name)}
                    to="/groups/$groupId"
                  >
                    {row.name}
                  </Link>
                )}
                <Badge variant={REQUEST_STATUS[row.status].variant}>
                  {REQUEST_STATUS[row.status].label()}
                </Badge>
              </div>
              <div sx={styles.meta}>
                <span>
                  {row.kind === "claim" ? m.my_requests_claim() : m.my_requests_new_group()}
                </span>
                <span aria-hidden>·</span>
                <TimeAgo date={row.createdAt} />
              </div>
              {row.note === null ? null : (
                <span sx={styles.note}>{m.request_review_note({ note: row.note })}</span>
              )}
            </div>
            {row.status === "PENDING" ? (
              <div sx={styles.actions}>
                <Button
                  disabled={cancelClaim.isPending || cancelCreation.isPending}
                  onClick={() => {
                    if (row.kind === "claim") {
                      cancelClaim.mutate(row.id)
                    } else {
                      cancelCreation.mutate(row.id)
                    }
                  }}
                  size="sm"
                  variant="ghost"
                >
                  {m.request_cancel()}
                </Button>
              </div>
            ) : null}
          </ListRow>
        ))}
      </ListCard>
    </DashboardSection>
  )
}
