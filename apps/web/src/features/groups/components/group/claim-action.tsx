import { Clock } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import type { Group } from "@/features/groups/api/groups"
import type { Session } from "@/lib/session"
import { myOwnershipRequestsQueryOptions } from "@/features/groups/api/groups"
import { ClaimGroupDialog } from "@/features/groups/components/group/claim-group-dialog"
import { m } from "@/paraglide/messages"

type ClaimActionProps = {
  group: Group
  user: Session["user"] | null
}

export function ClaimAction({ group, user }: ClaimActionProps) {
  const requests = useQuery({ ...myOwnershipRequestsQueryOptions, enabled: user !== null })
  const pending = requests.data?.some(
    (request) => request.groupId === group.id && request.status === "PENDING",
  )

  if (user === null) {
    return <Button render={<Link to="/auth/sign-in" />}>{m.group_claim_sign_in()}</Button>
  }

  if (pending === true) {
    return (
      <Button disabled variant="secondary">
        <Clock />
        {m.group_claim_pending()}
      </Button>
    )
  }

  return (
    <ClaimGroupDialog
      group={group}
      onClaimed={() => {
        void requests.refetch()
      }}
      trigger={<Button disabled={requests.isPending}>{m.group_claim()}</Button>}
    />
  )
}
