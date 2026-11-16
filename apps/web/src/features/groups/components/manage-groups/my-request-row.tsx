import * as stylex from "@stylexjs/stylex"
import { ExternalLink, FileEdit, Undo } from "@taiyomoe/ui/components/icons"
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
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import {
  RequestExcerpt,
  RequestTitle,
} from "@/features/groups/components/group-requests/group-request-row"
import {
  RequestStatusPill,
  RequestTypePill,
} from "@/features/groups/components/group-requests/request-parts"
import { groupTableStyles } from "@/features/groups/lib/group-table-styles"
import { m } from "@/paraglide/messages"

export function MyRequestRow({
  request,
  selection,
  onDetails,
  onCancel,
}: {
  request: GroupRequestItem
  selection: Selection
  onDetails: () => void
  onCancel: () => void
}) {
  const pending = request.status === "PENDING"
  const note =
    request.reviewerNote === null ? null : (
      <span sx={groupTableStyles.note} title={request.reviewerNote}>
        {m.request_review_note({ note: request.reviewerNote })}
      </span>
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
    ...(pending
      ? [
          {
            key: "cancel",
            label: m.request_cancel(),
            icon: Undo,
            destructive: true,
            onClick: onCancel,
          },
        ]
      : []),
  ]

  return (
    <TableRow>
      <CatalogSelectCell
        disabled={!pending}
        id={request.id}
        label={request.name}
        selection={selection}
      />
      <CatalogCell column="request">
        <TitleCell
          detail={<RequestExcerpt onOpen={onDetails} request={request} />}
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">
                  <RequestTypePill type={request.type} />
                  <RequestStatusPill status={request.status} />
                </Folded>
                <span {...stylex.props(catalogStyles.muted)}>
                  <TimeAgo date={request.createdAt} length="long" />
                </span>
                <Folded until="3xl">{note}</Folded>
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
      <CatalogCell column="type">
        <RequestTypePill type={request.type} />
      </CatalogCell>
      <CatalogCell column="status">
        <div {...stylex.props(catalogStyles.stack)}>
          <RequestStatusPill status={request.status} />
          {note}
        </div>
      </CatalogCell>
      <CatalogCell column="date" sx={catalogStyles.muted}>
        <TimeAgo date={request.createdAt} length="long" />
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions actions={actions} label={m.catalog_actions({ name: request.name })} />
      </CatalogCell>
    </TableRow>
  )
}
