import type { InferRequestType, InferResponseType } from "hono/client"
import { queryOptions } from "@tanstack/react-query"
import { isDefined, pickBy } from "remeda"
import type { GroupChapterOrder, GroupMediaSort } from "@/features/groups/lib/group-page"
import type { ContentRating } from "@/lib/settings"
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
