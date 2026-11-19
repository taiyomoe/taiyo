import { Button } from "@taiyomoe/ui/components/ui/button"
import type { GroupRequestType } from "@/features/groups/api/groups"
import type { GroupRequestItem } from "@/features/groups/lib/group-requests"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { renderWithName } from "@/components/user-name/with-name"
import { RequestDetailsDialog } from "@/features/groups/components/group-requests/request-parts"
import { ReviewNoteDialog } from "@/features/groups/components/review-note-dialog"
import { m } from "@/paraglide/messages"

export type GroupRequestDialog = {
  kind: "details" | "approve" | "reject"
  requests: GroupRequestItem[]
  /** Opened from the selection, which clears once the action succeeds. */
  bulk: boolean
}

const APPROVE_DESCRIPTIONS = {
  claims: {
    one: m.group_requests_approve_claim_description,
    many: m.group_requests_bulk_approve_claims_description,
  },
  creations: {
    one: m.group_requests_approve_creation_description,
    many: m.group_requests_approve_creation_description,
  },
}
const approveTitle = (type: GroupRequestType, requests: readonly GroupRequestItem[]) => {
  const [request] = requests

  if (requests.length !== 1 || request === undefined) {
    return m.group_requests_bulk_approve_title({ count: requests.length })
  }

  if (type === "creations") {
    return m.group_requests_approve_creation_title({ group: request.name })
  }

  return request.requester === null
    ? m.group_requests_approve_title()
    : renderWithName(
        (inputs) => m.group_requests_approve_claim_title({ ...inputs, group: request.name }),
        request.requester,
      )
}

/** The dialogs the request table opens, one at a time, for one row or for the selection. */
export function GroupRequestDialogs({
  type,
  dialog,
  pending,
  error,
  onApprove,
  onReject,
  onOpen,
  onClose,
}: {
  type: GroupRequestType
  dialog: GroupRequestDialog | null
  pending: boolean
  error: string | null
  onApprove: (requests: GroupRequestItem[]) => Promise<unknown>
  onReject: (requests: GroupRequestItem[], note: string) => void
  onOpen: (kind: "approve" | "reject", request: GroupRequestItem) => void
  onClose: () => void
}) {
  const [request] = dialog?.requests ?? []
  const shown = dialog?.kind === "details" ? (request ?? null) : null
  const approving = dialog?.kind === "approve" ? dialog.requests : null
  const many = (dialog?.requests.length ?? 0) > 1

  return (
    <>
      <RequestDetailsDialog
        footer={
          shown?.status === "PENDING" ? (
            <>
              <Button
                onClick={() => {
                  onOpen("reject", shown)
                }}
                variant="destructive-outline"
              >
                {m.review_reject()}
              </Button>
              <Button
                disabled={shown.blocker !== null}
                onClick={() => {
                  onOpen("approve", shown)
                }}
              >
                {m.review_approve()}
              </Button>
            </>
          ) : null
        }
        onClose={onClose}
        request={shown}
      />
      <ConfirmDialog
        confirmation={
          approving === null
            ? null
            : {
                title: approveTitle(type, approving),
                description: APPROVE_DESCRIPTIONS[type][many ? "many" : "one"](),
                confirmLabel: m.review_approve(),
                run: () => onApprove(approving),
              }
        }
        error={error}
        onClose={onClose}
        pending={pending}
      />
      <ReviewNoteDialog
        error={error}
        onClose={onClose}
        onConfirm={(note) => {
          if (dialog?.kind === "reject") {
            onReject(dialog.requests, note)
          }
        }}
        pending={pending}
        request={
          dialog?.kind === "reject"
            ? {
                title: many
                  ? m.group_requests_bulk_reject_title({ count: dialog.requests.length })
                  : m.review_reject_title(),
                description: many
                  ? m.group_requests_bulk_reject_description()
                  : m.review_reject_description(),
                label: m.review_reject_note(),
                placeholder: m.review_reject_note_placeholder(),
                required: true,
                confirmLabel: m.review_reject(),
                destructive: true,
              }
            : null
        }
      />
    </>
  )
}
