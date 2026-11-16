import type { InferRequestType, InferResponseType } from "hono/client"
import { keepPreviousData, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { isDefined, pickBy } from "remeda"
import type { BulkResult } from "@/features/catalog/api/catalog"
import type { GroupChapterOrder, GroupMediaSort } from "@/features/groups/lib/group-page"
import type { ContentRating } from "@/lib/settings"
import { CATALOG_PER_PAGE } from "@/features/catalog/api/catalog"
import { api } from "@/lib/api"
import { unwrap, unwrapEnvelope } from "@/lib/envelope"

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

export type MyGroupCreationRequest = InferResponseType<
  (typeof api.users.me)["group-creation-requests"]["$get"],
  200
>["data"][number]

export type OwnershipRequest = InferResponseType<
  (typeof api)["ownership-requests"]["$get"],
  200
>["data"][number]

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

export const groupFollowQueryOptions = (groupId: string) =>
  queryOptions({
    queryKey: ["groups", groupId, "follow"],
    queryFn: async ({ signal }) =>
      unwrap(await api.groups[":id"].follow.$get({ param: { id: groupId } }, { init: { signal } })),
  })

export const groupMediaUpdatesQueryOptions = (
  groupId: string,
  contentRatings: readonly ContentRating[],
  {
    page,
    perPage,
    order,
    search,
    mediaId,
  }: {
    page: number
    perPage: number
    order: GroupChapterOrder
    search: string | undefined
    mediaId: string | undefined
  },
) =>
  queryOptions({
    queryKey: [
      "chapters",
      "latest",
      "medias",
      { groupId, contentRatings, page, perPage, order, search, mediaId },
    ],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.chapters.latest.medias.$get(
          {
            query: pickBy(
              {
                groupId,
                mediaId,
                search,
                order,
                contentRating: contentRatings.join(","),
                page: String(page),
                perPage: String(perPage),
              },
              isDefined,
            ),
          },
          { init: { signal } },
        ),
      ),
  })

export const groupMediasQueryOptions = (
  groupId: string,
  contentRatings: readonly ContentRating[],
  { page, perPage, sort }: { page: number; perPage: number; sort: GroupMediaSort },
) =>
  queryOptions({
    queryKey: ["groups", groupId, "medias", { contentRatings, page, perPage, sort }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.groups[":id"].medias.$get(
          {
            param: { id: groupId },
            query: {
              sort,
              contentRating: contentRatings.join(","),
              page: String(page),
              perPage: String(perPage),
            },
          },
          { init: { signal } },
        ),
      ),
  })

export type GroupMedia = InferResponseType<
  (typeof api.groups)[":id"]["medias"]["$get"],
  200
>["data"][number]

export const groupStatsQueryOptions = (groupId: string, contentRatings: readonly ContentRating[]) =>
  queryOptions({
    queryKey: ["groups", groupId, "stats", { contentRatings }],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.groups[":id"].stats.$get(
          { param: { id: groupId }, query: { contentRating: contentRatings.join(",") } },
          { init: { signal } },
        ),
      ),
  })

export type GroupStats = InferResponseType<(typeof api.groups)[":id"]["stats"]["$get"], 200>["data"]

export type GroupReportInput = InferRequestType<
  (typeof api.groups)[":id"]["reports"]["$post"]
>["json"]

export type GroupReport = InferResponseType<
  (typeof api)["group-reports"]["$get"],
  200
>["data"][number]

export type ManagedGroupsFilter = {
  search?: string | undefined
  owned?: boolean | undefined
  page: number
}

export type ManagedGroup = InferResponseType<typeof api.groups.managed.$get, 200>["data"][number]

export const managedGroupsQueryOptions = (filter: ManagedGroupsFilter) =>
  queryOptions({
    queryKey: ["groups", "manage", filter],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.groups.managed.$get(
          {
            query: {
              page: String(filter.page),
              perPage: String(CATALOG_PER_PAGE),
              ...(filter.search === undefined ? {} : { search: filter.search }),
              ...(filter.owned === undefined ? {} : { owned: filter.owned ? "true" : "false" }),
            },
          },
          { init: { signal } },
        ),
      ),
    placeholderData: keepPreviousData,
  })

export const useDeleteGroups = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (groupIds: string[]) =>
      unwrap(await api.groups.$delete({ json: { groupIds } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  })
}

export type GroupRequestType = "claims" | "creations"

export type GroupRequestStatus = OwnershipRequest["status"]

export type GroupRequestsFilter = {
  type: GroupRequestType
  status: GroupRequestStatus
  page: number
}

export const ownershipRequestsQueryOptions = ({
  status,
  page,
  perPage = CATALOG_PER_PAGE,
}: {
  status: GroupRequestStatus
  page: number
  perPage?: number
}) =>
  queryOptions({
    queryKey: ["ownership-requests", { status, page, perPage }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api["ownership-requests"].$get(
          { query: { status, page: String(page), perPage: String(perPage) } },
          { init: { signal } },
        ),
      ),
    placeholderData: keepPreviousData,
  })

export const groupCreationRequestsQueryOptions = ({
  status,
  page,
  perPage = CATALOG_PER_PAGE,
}: {
  status: GroupRequestStatus
  page: number
  perPage?: number
}) =>
  queryOptions({
    queryKey: ["group-creation-requests", { status, page, perPage }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api["group-creation-requests"].$get(
          { query: { status, page: String(page), perPage: String(perPage) } },
          { init: { signal } },
        ),
      ),
    placeholderData: keepPreviousData,
  })

export type GroupReportsFilter = {
  status: GroupReport["status"]
  reason?: GroupReport["reason"] | undefined
  page: number
}

export const groupReportsQueryOptions = ({ status, reason, page }: GroupReportsFilter) =>
  queryOptions({
    queryKey: ["group-reports", { status, reason, page }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api["group-reports"].$get(
          {
            query: {
              status,
              page: String(page),
              perPage: String(CATALOG_PER_PAGE),
              ...(reason === undefined ? {} : { reason }),
            },
          },
          { init: { signal } },
        ),
      ),
    placeholderData: keepPreviousData,
  })

const useGroupsMutation = <TInput>(
  run: (input: TInput) => Promise<BulkResult>,
  queryKeys: ReadonlyArray<readonly string[]>,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: run,
    onSuccess: () =>
      Promise.all(queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
  })
}

export const useAnswerInvitations = (answer: "accept" | "decline") =>
  useGroupsMutation(
    async (invitationIds: string[]) =>
      answer === "accept"
        ? unwrap(await api["group-invitations"].accept.$post({ json: { invitationIds } }))
        : unwrap(await api["group-invitations"].decline.$post({ json: { invitationIds } })),
    [["me"], ["groups"]],
  )

/** Withdraws the user's own claims and creation requests, whatever their mix. */
export const useCancelMyRequests = () =>
  useGroupsMutation(
    async ({ claims, creations }: { claims: string[]; creations: string[] }) => {
      const [claimed, created] = await Promise.all([
        claims.length === 0
          ? null
          : api["ownership-requests"].$delete({ json: { requestIds: claims } }).then(unwrap),
        creations.length === 0
          ? null
          : api["group-creation-requests"]
              .$delete({ json: { requestIds: creations } })
              .then(unwrap),
      ])

      return {
        done: [...(claimed?.done ?? []), ...(created?.done ?? [])],
        skipped: [...(claimed?.skipped ?? []), ...(created?.skipped ?? [])],
      } satisfies BulkResult
    },
    [["me"]],
  )

export const useApproveGroupRequests = (type: GroupRequestType) =>
  useGroupsMutation(
    async (requestIds: string[]) =>
      type === "claims"
        ? unwrap(await api["ownership-requests"].approve.$post({ json: { requestIds } }))
        : unwrap(await api["group-creation-requests"].approve.$post({ json: { requestIds } })),
    [["ownership-requests"], ["group-creation-requests"], ["groups"]],
  )

export const useRejectGroupRequests = (type: GroupRequestType) =>
  useGroupsMutation(
    async ({ requestIds, note }: { requestIds: string[]; note: string }) =>
      type === "claims"
        ? unwrap(await api["ownership-requests"].reject.$post({ json: { requestIds, note } }))
        : unwrap(await api["group-creation-requests"].reject.$post({ json: { requestIds, note } })),
    [["ownership-requests"], ["group-creation-requests"]],
  )

export const useReviewGroupReports = () =>
  useGroupsMutation(
    async (json: { reportIds: string[]; status: "RESOLVED" | "DISMISSED"; note?: string }) =>
      unwrap(await api["group-reports"].review.$post({ json })),
    [["group-reports"]],
  )
