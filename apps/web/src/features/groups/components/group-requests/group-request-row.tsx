import * as stylex from "@stylexjs/stylex"
import { CheckCircle, Close, ExternalLink, FileEdit, User } from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { Link } from "@tanstack/react-router"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import type { GroupRequestItem } from "@/features/groups/lib/group-requests"
import { TimeAgo } from "@/components/time/time-ago"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import { mediaCellStyles, TitleCell, Folded } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { Uploader } from "@/features/chapters/components/uploader"
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import {
  ProofSummary,
  RequestBlockerPill,
  RequestStatusPill,
} from "@/features/groups/components/group-requests/request-parts"
import { groupTableStyles } from "@/features/groups/lib/group-table-styles"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  plain: {
    textDecoration: "none",
  },
})

/** The group a request is about: a link once the group exists, its requested name before. */
export function RequestTitle({ request }: { request: GroupRequestItem }) {
  return request.groupId === null ? (
    <span sx={[mediaCellStyles.title, styles.plain]} title={request.name}>
      {request.name}
    </span>
  ) : (
    <Link
      params={{ groupId: request.groupId }}
      title={request.name}
      to="/groups/$groupId"
      {...stylex.props(mediaCellStyles.title)}
    >
      {request.name}
    </Link>
  )
}

/** The message of the request, clamped, opening the request in full. */
export function RequestExcerpt({
  request,
  onOpen,
}: {
  request: GroupRequestItem
  onOpen: () => void
}) {
  return (
    <button
      onClick={onOpen}
      sx={[
        groupTableStyles.textButton,
        groupTableStyles.excerpt,
        request.message === null && groupTableStyles.empty,
      ]}
      title={request.message ?? undefined}
      type="button"
    >
      {request.message ?? m.group_requests_no_message()}
    </button>
  )
}

export function GroupRequestRow({
  request,
  selection,
  onDetails,
  onApprove,
  onReject,
}: {
  request: GroupRequestItem
  selection: Selection | undefined
  onDetails: () => void
  onApprove: () => void
  onReject: () => void
}) {
  const pending = request.status === "PENDING"
  const requester =
    request.requester === null ? null : (
      <Uploader
        title={m.group_requests_requested_by({ name: request.requester.displayUsername })}
        uploader={request.requester}
      />
    )
  const proof = <ProofSummary links={request.proofLinks} onMore={onDetails} />
  const outcome = pending ? (
    <RequestBlockerPill blocker={request.blocker} />
  ) : (
    <>
      <RequestStatusPill status={request.status} />
      {request.reviewerNote === null ? null : (
        <span sx={groupTableStyles.note} title={request.reviewerNote}>
          {request.reviewerNote}
        </span>
      )}
    </>
  )
  const actions: RowAction[] = [
    { key: "details", label: m.group_requests_view_details(), icon: FileEdit, onClick: onDetails },
    ...(request.groupId === null
      ? []
      : [
          {
            key: "group",
            label: m.all_groups_view_page(),
            icon: ExternalLink,
            render: <Link params={{ groupId: request.groupId }} to="/groups/$groupId" />,
          },
        ]),
    ...(request.requester === null
      ? []
      : [
          {
            key: "requester",
            label: m.group_requests_view_requester(),
            icon: User,
            render: (
              <Link params={{ username: request.requester.username }} to="/users/$username" />
            ),
          },
        ]),
    ...(pending
      ? [
          {
            key: "approve",
            label: m.review_approve(),
            icon: CheckCircle,
            disabled: request.blocker !== null,
            onClick: onApprove,
          },
          {
            key: "reject",
            label: m.review_reject(),
            icon: Close,
            destructive: true,
            onClick: onReject,
          },
        ]
      : []),
  ]

  return (
    <TableRow>
      {selection === undefined ? null : (
        <CatalogSelectCell id={request.id} label={request.name} selection={selection} />
      )}
      <CatalogCell column="request">
        <TitleCell
          detail={<RequestExcerpt onOpen={onDetails} request={request} />}
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">{requester}</Folded>
                {proof}
                <Folded until="3xl">
                  <span {...stylex.props(catalogStyles.muted)}>
                    <TimeAgo date={request.createdAt} length="long" />
                  </span>
                  {outcome}
                </Folded>
              </>
            ),
          }}
          thumb={
            <GroupAvatar
              id={request.groupId ?? request.id}
              name={request.name}
              sx={mediaCellStyles.avatar}
            />
          }
          title={<RequestTitle request={request} />}
        />
      </CatalogCell>
      <CatalogCell column="requester">{requester}</CatalogCell>
      <CatalogCell column="proof">{proof}</CatalogCell>
      <CatalogCell column="date" sx={catalogStyles.muted}>
        <div {...stylex.props(catalogStyles.stack)}>
          <TimeAgo date={request.createdAt} length="long" />
          {outcome}
        </div>
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions actions={actions} label={m.catalog_actions({ name: request.name })} />
      </CatalogCell>
    </TableRow>
  )
}
