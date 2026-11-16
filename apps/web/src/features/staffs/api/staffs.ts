import type { InferResponseType } from "hono/client"
import { keepPreviousData, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { CATALOG_PER_PAGE } from "@/features/catalog/api/catalog"
import { api } from "@/lib/api"
import { unwrap, unwrapEnvelope } from "@/lib/envelope"

export type StaffsFilter = {
  search?: string | undefined
  page: number
}

export type ManagedStaff = InferResponseType<typeof api.staffs.managed.$get, 200>["data"][number]

export const managedStaffsQueryOptions = (filter: StaffsFilter) =>
  queryOptions({
    queryKey: ["staffs", "manage", filter],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.staffs.managed.$get(
          {
            query: {
              page: String(filter.page),
              perPage: String(CATALOG_PER_PAGE),
              ...(filter.search === undefined ? {} : { search: filter.search }),
            },
          },
          { init: { signal } },
        ),
      ),
    placeholderData: keepPreviousData,
  })

export const useDeleteStaffs = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (staffIds: string[]) =>
      unwrap(await api.staffs.$delete({ json: { staffIds } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staffs"] }),
  })
}

export const useRenameStaff = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const body = new FormData()

      body.set("name", name)

      // The Hono client has no typed multipart input for this route, so the
      // request goes through fetch and the envelope is typed by hand.
      const response = await fetch(api.staffs[":id"].$url({ param: { id } }), {
        method: "PATCH",
        body,
        credentials: "include",
      })

      await unwrap(
        response as {
          status: number
          json: () => Promise<
            | { success: true; data: { id: string } }
            | { success: false; code: string; message: string }
          >
        },
      )
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staffs"] }),
  })
}
