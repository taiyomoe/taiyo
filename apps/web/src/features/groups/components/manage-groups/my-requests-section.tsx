import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { MyGroupCreationRequest, MyOwnershipRequest } from "@/features/groups/api/groups"
import { DashboardSection, ListCard } from "@/components/layout/dashboard-page"
import { MyRequestRow } from "@/features/groups/components/manage-groups/my-request-row"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { m } from "@/paraglide/messages"

type MyRequestsSectionProps = {
  claims: MyOwnershipRequest[]
  creations: MyGroupCreationRequest[]
}

export function MyRequestsSection({ claims, creations }: MyRequestsSectionProps) {
  const queryClient = useQueryClient()
  const cancelClaim = useMutation({
    mutationFn: async (id: string) =>
      ensureSuccess(await api["ownership-requests"][":id"].$delete({ param: { id } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me", "ownership-requests"] }),
  })
  const cancelCreation = useMutation({
    mutationFn: async (id: string) =>
      ensureSuccess(await api["group-creation-requests"][":id"].$delete({ param: { id } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me", "group-creation-requests"] }),
  })
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
          <MyRequestRow
            cancelling={cancelClaim.isPending || cancelCreation.isPending}
            key={row.id}
            onCancel={() => {
              if (row.kind === "claim") {
                cancelClaim.mutate(row.id)
              } else {
                cancelCreation.mutate(row.id)
              }
            }}
            row={row}
          />
        ))}
      </ListCard>
    </DashboardSection>
  )
}
