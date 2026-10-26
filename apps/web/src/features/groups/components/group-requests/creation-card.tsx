import * as stylex from "@stylexjs/stylex"
import { AlertTriangle } from "@taiyomoe/ui/components/icons"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { GroupCreationRequest } from "@/features/groups/api/groups"
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

const styles = stylex.create({
  about: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
    lineHeight: 1.6,
    whiteSpace: "pre-line",
  },
})

type CreationCardProps = {
  request: GroupCreationRequest
}

export function CreationCard({ request }: CreationCardProps) {
  const queryClient = useQueryClient()
  const review = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string | null }) =>
      ensureSuccess(
        note === null
          ? await api["group-creation-requests"][":id"].approve.$post({ param: { id } })
          : await api["group-creation-requests"][":id"].reject.$post({
              param: { id },
              json: { note },
            }),
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["group-creation-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["groups"] }),
      ]),
  })

  return (
    <li sx={requestCardStyles.card}>
      <div sx={requestCardStyles.top}>
        <Requester person={request.requester} verb={m.review_wants_to_create()} />
        <TimeAgo date={request.createdAt} sx={requestCardStyles.time} />
      </div>
      <div sx={requestCardStyles.target}>
        <GroupAvatar id={request.id} name={request.name} />
        <span sx={requestCardStyles.targetName}>{request.name}</span>
      </div>
      {request.description === null ? null : <p sx={styles.about}>{request.description}</p>}
      <p sx={requestCardStyles.quote}>{request.message}</p>
      <ProofLinks links={request.proofLinks} />
      {request.nameTaken ? (
        <div sx={requestCardStyles.warning}>
          <AlertTriangle size={16} />
          {m.review_name_taken()}
        </div>
      ) : null}
      <ReviewActions
        approveDisabled={request.nameTaken}
        error={review.isError ? getErrorMessage(review.error) : null}
        onApprove={() => review.mutateAsync({ id: request.id, note: null })}
        onReject={(note) => review.mutateAsync({ id: request.id, note })}
        pending={review.isPending}
      />
    </li>
  )
}
