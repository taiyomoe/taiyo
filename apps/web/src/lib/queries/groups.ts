import type { GroupPermission } from "@taiyomoe/permissions"
import type { InferRequestType, InferResponseType } from "hono/client"
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ContentRating } from "@/lib/settings"
import { api } from "@/lib/api"
import { ensureSuccess, unwrap, unwrapEnvelope } from "@/lib/envelope"

export const GROUPS_PER_PAGE = 24

export const groupsQueryOptions = ({
  search,
  page,
}: {
  search: string | undefined
  page: number
}) =>
  queryOptions({
    queryKey: ["groups", "list", { search, page }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.groups.$get(
          {
            query: {
              page: String(page),
              perPage: String(GROUPS_PER_PAGE),
              ...(search === undefined ? {} : { search }),
            },
          },
          { init: { signal } },
        ),
      ),
  })

export const groupQueryOptions = (groupId: string) =>
  queryOptions({
    queryKey: ["groups", groupId],
    queryFn: async ({ signal }) =>
      unwrap(await api.groups[":id"].$get({ param: { id: groupId } }, { init: { signal } })),
  })

export type Group = InferResponseType<(typeof api.groups)[":id"]["$get"], 200>["data"]

export const groupMembersQueryOptions = (groupId: string) =>
  queryOptions({
    queryKey: ["groups", groupId, "members"],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.groups[":id"].members.$get({ param: { id: groupId } }, { init: { signal } }),
      ),
  })

export type GroupMember = InferResponseType<
  (typeof api.groups)[":id"]["members"]["$get"],
  200
>["data"][number]

export const groupInvitationsQueryOptions = (groupId: string) =>
  queryOptions({
    queryKey: ["groups", groupId, "invitations"],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.groups[":id"].invitations.$get({ param: { id: groupId } }, { init: { signal } }),
      ),
  })

export const groupChaptersQueryOptions = (
  groupId: string,
  contentRatings: readonly ContentRating[],
  page: number,
  perPage: number,
) =>
  queryOptions({
    queryKey: ["chapters", "latest", { groupId, contentRatings, page, perPage }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.chapters.latest.$get(
          {
            query: {
              groupId,
              contentRating: contentRatings.join(","),
              page: String(page),
              perPage: String(perPage),
            },
          },
          { init: { signal } },
        ),
      ),
  })

export const myGroupsQueryOptions = queryOptions({
  queryKey: ["me", "groups"],
  queryFn: async ({ signal }) =>
    unwrap(await api.users.me.groups.$get(undefined, { init: { signal } })),
})

export type MyGroup = InferResponseType<typeof api.users.me.groups.$get, 200>["data"][number]

export const myGroupInvitationsQueryOptions = queryOptions({
  queryKey: ["me", "group-invitations"],
  queryFn: async ({ signal }) =>
    unwrap(await api.users.me["group-invitations"].$get(undefined, { init: { signal } })),
})

export type MyGroupInvitation = InferResponseType<
  (typeof api.users.me)["group-invitations"]["$get"],
  200
>["data"][number]

export const myOwnershipRequestsQueryOptions = queryOptions({
  queryKey: ["me", "ownership-requests"],
  queryFn: async ({ signal }) =>
    unwrap(await api["ownership-requests"].mine.$get({ query: {} }, { init: { signal } })),
})

export type MyOwnershipRequest = InferResponseType<
  (typeof api)["ownership-requests"]["mine"]["$get"],
  200
>["data"][number]

export const myGroupCreationRequestsQueryOptions = queryOptions({
  queryKey: ["me", "group-creation-requests"],
  queryFn: async ({ signal }) =>
    unwrap(await api.users.me["group-creation-requests"].$get(undefined, { init: { signal } })),
})

const REVIEW_PER_PAGE = 20

export const ownershipRequestsQueryOptions = (page: number) =>
  queryOptions({
    queryKey: ["ownership-requests", { page }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api["ownership-requests"].$get(
          { query: { page: String(page), perPage: String(REVIEW_PER_PAGE) } },
          { init: { signal } },
        ),
      ),
  })

export type OwnershipRequest = InferResponseType<
  (typeof api)["ownership-requests"]["$get"],
  200
>["data"][number]

export const groupCreationRequestsQueryOptions = (page: number) =>
  queryOptions({
    queryKey: ["group-creation-requests", { page }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api["group-creation-requests"].$get(
          { query: { page: String(page), perPage: String(REVIEW_PER_PAGE) } },
          { init: { signal } },
        ),
      ),
  })

export type GroupCreationRequest = InferResponseType<
  (typeof api)["group-creation-requests"]["$get"],
  200
>["data"][number]

export type ClaimInput = InferRequestType<
  (typeof api.groups)[":id"]["ownership-requests"]["$post"]
>["json"]

export type GroupCreationInput = InferRequestType<
  (typeof api)["group-creation-requests"]["$post"]
>["json"]

export type GroupUpdateInput = InferRequestType<(typeof api.groups)[":id"]["$patch"]>["json"]

const useInvalidate = () => {
  const queryClient = useQueryClient()

  return (...keys: string[][]) =>
    Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
}

export function useClaimGroup(groupId: string) {
  const invalidate = useInvalidate()

  return useMutation({
    mutationFn: async (json: ClaimInput) =>
      ensureSuccess(
        await api.groups[":id"]["ownership-requests"].$post({ param: { id: groupId }, json }),
      ),
    onSuccess: () => invalidate(["me", "ownership-requests"]),
  })
}

export function useCancelOwnershipRequest() {
  const invalidate = useInvalidate()

  return useMutation({
    mutationFn: async (id: string) =>
      ensureSuccess(await api["ownership-requests"][":id"].$delete({ param: { id } })),
    onSuccess: () => invalidate(["me", "ownership-requests"]),
  })
}

export function useRequestGroup() {
  const invalidate = useInvalidate()

  return useMutation({
    mutationFn: async (json: GroupCreationInput) =>
      ensureSuccess(await api["group-creation-requests"].$post({ json })),
    onSuccess: () => invalidate(["me", "group-creation-requests"]),
  })
}

export function useCancelGroupCreationRequest() {
  const invalidate = useInvalidate()

  return useMutation({
    mutationFn: async (id: string) =>
      ensureSuccess(await api["group-creation-requests"][":id"].$delete({ param: { id } })),
    onSuccess: () => invalidate(["me", "group-creation-requests"]),
  })
}

export function useInviteMember(groupId: string) {
  const invalidate = useInvalidate()

  return useMutation({
    mutationFn: async (json: { username: string; permissions: GroupPermission[] }) =>
      ensureSuccess(await api.groups[":id"].invitations.$post({ param: { id: groupId }, json })),
    onSuccess: () => invalidate(["groups", groupId, "invitations"]),
  })
}

export function useCancelInvitation(groupId: string) {
  const invalidate = useInvalidate()

  return useMutation({
    mutationFn: async (invitationId: string) =>
      ensureSuccess(
        await api.groups[":id"].invitations[":invitationId"].$delete({
          param: { id: groupId, invitationId },
        }),
      ),
    onSuccess: () => invalidate(["groups", groupId, "invitations"]),
  })
}

export function useAnswerInvitation() {
  const invalidate = useInvalidate()

  return useMutation({
    mutationFn: async ({ id, accept }: { id: string; accept: boolean }) =>
      ensureSuccess(
        accept
          ? await api["group-invitations"][":id"].accept.$post({ param: { id } })
          : await api["group-invitations"][":id"].decline.$post({ param: { id } }),
      ),
    onSuccess: () => invalidate(["me"], ["groups"]),
  })
}

export function useUpdateMemberPermissions(groupId: string) {
  const invalidate = useInvalidate()

  return useMutation({
    mutationFn: async ({
      userId,
      permissions,
    }: {
      userId: string
      permissions: GroupPermission[]
    }) =>
      ensureSuccess(
        await api.groups[":id"].members[":userId"].$patch({
          param: { id: groupId, userId },
          json: { permissions },
        }),
      ),
    onSuccess: () => invalidate(["groups", groupId], ["me", "groups"]),
  })
}

export function useMemberAction(groupId: string) {
  const invalidate = useInvalidate()

  return useMutation({
    mutationFn: async ({
      userId,
      action,
    }: {
      userId: string
      action: "remove" | "promote" | "demote"
    }) => {
      const param = { id: groupId, userId }

      if (action === "remove") {
        return ensureSuccess(await api.groups[":id"].members[":userId"].$delete({ param }))
      }

      return ensureSuccess(
        action === "promote"
          ? await api.groups[":id"].members[":userId"].promote.$post({ param })
          : await api.groups[":id"].members[":userId"].demote.$post({ param }),
      )
    },
    onSuccess: () => invalidate(["groups", groupId], ["me", "groups"]),
  })
}

export function useLeaveGroup(groupId: string) {
  const invalidate = useInvalidate()

  return useMutation({
    mutationFn: async () =>
      ensureSuccess(await api.groups[":id"].leave.$post({ param: { id: groupId } })),
    onSuccess: () => invalidate(["groups", groupId], ["me", "groups"]),
  })
}

export function useUpdateGroup(groupId: string) {
  const invalidate = useInvalidate()

  return useMutation({
    mutationFn: async (json: GroupUpdateInput) =>
      ensureSuccess(await api.groups[":id"].$patch({ param: { id: groupId }, json })),
    onSuccess: () => invalidate(["groups"], ["me", "groups"]),
  })
}

export function useReviewOwnershipRequest() {
  const invalidate = useInvalidate()

  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string | null }) =>
      ensureSuccess(
        note === null
          ? await api["ownership-requests"][":id"].approve.$post({ param: { id } })
          : await api["ownership-requests"][":id"].reject.$post({ param: { id }, json: { note } }),
      ),
    onSuccess: () => invalidate(["ownership-requests"], ["groups"]),
  })
}

export function useReviewGroupCreationRequest() {
  const invalidate = useInvalidate()

  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string | null }) =>
      ensureSuccess(
        note === null
          ? await api["group-creation-requests"][":id"].approve.$post({ param: { id } })
          : await api["group-creation-requests"][":id"].reject.$post({
              param: { id },
              json: { note },
            }),
      ),
    onSuccess: () => invalidate(["group-creation-requests"], ["groups"]),
  })
}
