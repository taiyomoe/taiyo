import * as stylex from "@stylexjs/stylex"
import { AlertTriangle } from "@taiyomoe/ui/components/icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import type { OwnershipRequest } from "@/features/groups/api/groups"
import { TimeAgo } from "@/components/time/time-ago"
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import { ProofLinks } from "@/features/groups/components/group-requests/proof-links"
import { requestCardStyles } from "@/features/groups/components/group-requests/request-card-styles"
import { Requester } from "@/features/groups/components/group-requests/requester"
import { ReviewActions } from "@/features/groups/components/group-requests/review-actions"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

type ClaimCardProps = {
  request: OwnershipRequest
}

export function ClaimCard({ request }: ClaimCardProps) {
  const queryClient = useQueryClient()
  const review = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string | null }) =>
      ensureSuccess(
        note === null
          ? await api["ownership-requests"][":id"].approve.$post({ param: { id } })
          : await api["ownership-requests"][":id"].reject.$post({ param: { id }, json: { note } }),
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ownership-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["groups"] }),
      ]),
  })

  return (
    <li sx={requestCardStyles.card}>
      <div sx={requestCardStyles.top}>
        <Requester person={request.requester} verb={m.review_wants_to_claim()} />
        <TimeAgo date={request.createdAt} sx={requestCardStyles.time} />
      </div>
      <div sx={requestCardStyles.target}>
        <GroupAvatar id={request.group.id} name={request.group.name} />
        <Link
          params={{ groupId: request.group.id }}
          {...stylex.props(requestCardStyles.targetName)}
          to="/groups/$groupId"
        >
          {request.group.name}
        </Link>
      </div>
      {request.message === null ? null : <p sx={requestCardStyles.quote}>{request.message}</p>}
      {request.proofLinks.length === 0 ? null : <ProofLinks links={request.proofLinks} />}
      {request.group.owned ? (
        <div sx={requestCardStyles.warning}>
          <AlertTriangle size={16} />
          {m.review_already_owned()}
        </div>
      ) : null}
      <ReviewActions
        approveDisabled={request.group.owned}
        error={review.isError ? getErrorMessage(review.error) : null}
        onApprove={() => review.mutateAsync({ id: request.id, note: null })}
        onReject={(note) => review.mutateAsync({ id: request.id, note })}
        pending={review.isPending}
      />
    </li>
  )
}
