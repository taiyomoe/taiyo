import { Check, Close, Mail } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import type { MyGroupInvitation } from "@/features/groups/api/groups"
import type { InvitationDialog } from "@/features/groups/components/invitations/invitation-dialogs"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { BulkBar } from "@/features/catalog/components/shared/bulk-bar"
import {
  SkeletonActions,
  SkeletonMediaCell,
  SkeletonPill,
  SkeletonText,
  SkeletonUsers,
} from "@/features/catalog/components/shared/catalog-skeletons"
import {
  CatalogFooter,
  CatalogTable,
  VisuallyHidden,
} from "@/features/catalog/components/shared/catalog-table"
import { useSelection } from "@/features/catalog/hooks/use-selection"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { formatNumber } from "@/features/dashboard/lib/format"
import { myGroupInvitationsQueryOptions, useAnswerInvitations } from "@/features/groups/api/groups"
import { InvitationDialogs } from "@/features/groups/components/invitations/invitation-dialogs"
import { InvitationRow } from "@/features/groups/components/invitations/invitation-row"
import { toastGroupsResult } from "@/features/groups/lib/group-bulk-toast"
import { groupTableStyles } from "@/features/groups/lib/group-table-styles"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const SKIP_REASONS = {
  NOT_PENDING: m.invitation_skipped_answered,
  EXPIRED: m.invitation_skipped_expired,
  INVALID: m.invitation_skipped_invalid,
  ALREADY_MEMBER: m.invitation_skipped_member,
}

export function InvitationsPage() {
  const { data } = useQuery(myGroupInvitationsQueryOptions)
  const navigate = useNavigate()
  const accept = useAnswerInvitations("accept")
  const decline = useAnswerInvitations("decline")
  const selection = useSelection(data?.map((invitation) => invitation.id) ?? [])
  const [dialog, setDialog] = useState<InvitationDialog | null>(null)
  const answering = accept.isPending || decline.isPending
  const selected = () => data?.filter((invitation) => selection.has(invitation.id)) ?? []
  const onError = (error: unknown) => {
    toastManager.add({ title: getErrorMessage(error), type: "error" })
  }
  const acceptOne = (invitation: MyGroupInvitation) => {
    accept.mutateAsync([invitation.id]).then((result) => {
      setDialog(null)

      if (result.done.length === 0) {
        toastGroupsResult(result, m.invitation_bulk_accepted, SKIP_REASONS)

        return
      }

      const id = toastManager.add({
        title: m.invitation_joined({ name: invitation.group.name }),
        type: "success",
        actionProps: {
          children: m.my_groups_manage(),
          onClick: () => {
            toastManager.close(id)
            void navigate({
              params: { groupId: invitation.group.id },
              to: "/dashboard/groups/$groupId",
            })
          },
        },
      })
    }, onError)
  }

  return (
    <DashboardPage subtitle={m.my_invitations_subtitle()} title={m.my_invitations_title()}>
      <CatalogTable
        bulkBar={
          <BulkBar count={selection.ids.length} onClear={selection.clear}>
            <Button
              loading={accept.isPending}
              onClick={() => {
                accept.mutateAsync(selection.ids).then((result) => {
                  toastGroupsResult(result, m.invitation_bulk_accepted, SKIP_REASONS)
                  selection.clear()
                }, onError)
              }}
              variant="outline"
            >
              <Check />
              {m.invitation_accept()}
            </Button>
            <Button
              disabled={answering}
              onClick={() => {
                setDialog({ kind: "decline", invitations: selected(), bulk: true })
              }}
              variant="destructive-outline"
            >
              <Close />
              {m.invitation_decline()}
            </Button>
          </BulkBar>
        }
        columns={[
          {
            key: "group",
            label: m.all_groups_column_group(),
            skeleton: <SkeletonMediaCell narrow={{ from: "4xl", content: "pills" }} thumb="logo" />,
          },
          {
            key: "inviter",
            label: m.invitation_column_inviter(),
            width: catalogStyles.colWide,
            from: "3xl",
            skeleton: <SkeletonUsers />,
          },
          {
            key: "permissions",
            label: m.invitation_column_permissions(),
            width: groupTableStyles.colPermissions,
            from: "3xl",
            skeleton: <SkeletonPill width="6.5rem" />,
          },
          {
            key: "date",
            label: m.invitation_column_received(),
            width: catalogStyles.colMedium,
            from: "4xl",
            skeleton: <SkeletonText width="5.5rem" />,
          },
          {
            key: "actions",
            label: <VisuallyHidden>{m.catalog_column_actions()}</VisuallyHidden>,
            width: catalogStyles.colActions,
            skeleton: <SkeletonActions />,
          },
        ]}
        empty={
          data?.length === 0
            ? {
                icon: Mail,
                title: m.my_invitations_empty_title(),
                description: m.my_invitations_empty_description(),
              }
            : null
        }
        footer={
          data === undefined ? null : (
            <CatalogFooter total={m.catalog_results({ count: formatNumber(data.length) })}>
              {null}
            </CatalogFooter>
          )
        }
        loading={data === undefined}
        selection={selection}
        toolbar={null}
      >
        {data?.map((invitation) => (
          <InvitationRow
            answering={answering}
            invitation={invitation}
            key={invitation.id}
            onAccept={() => {
              acceptOne(invitation)
            }}
            onDecline={() => {
              setDialog({ kind: "decline", invitations: [invitation], bulk: false })
            }}
            onDetails={() => {
              setDialog({ kind: "details", invitations: [invitation], bulk: false })
            }}
            selection={selection}
          />
        ))}
      </CatalogTable>
      <InvitationDialogs
        answering={answering}
        declineError={decline.isError ? getErrorMessage(decline.error) : null}
        dialog={dialog}
        onAccept={acceptOne}
        onClose={() => {
          setDialog(null)
          decline.reset()
        }}
        onDecline={(invitations) =>
          decline.mutateAsync(invitations.map((invitation) => invitation.id)).then((result) => {
            const [only] = invitations

            toastGroupsResult(
              result,
              invitations.length === 1 && only !== undefined
                ? () => m.invitation_declined({ name: only.group.name })
                : m.invitation_bulk_declined,
              SKIP_REASONS,
            )

            if (dialog?.bulk === true) {
              selection.clear()
            }
          })
        }
        onOpenDecline={(invitation) => {
          setDialog({ kind: "decline", invitations: [invitation], bulk: false })
        }}
      />
    </DashboardPage>
  )
}
