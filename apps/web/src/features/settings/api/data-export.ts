import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { ApiError, unwrap } from "@/lib/envelope"

const POLL_MS = 5000

export const myDataExportQueryOptions = queryOptions({
  queryKey: ["settings", "data-export"],
  queryFn: async () => {
    const response = await api.users.me["data-exports"].latest.$get()

    return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
  },
  refetchInterval: (query) => (query.state.data?.latest?.status === "PENDING" ? POLL_MS : false),
})

export type DataExportState = NonNullable<
  Awaited<ReturnType<NonNullable<typeof myDataExportQueryOptions.queryFn>>>
>

export function useRequestDataExport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await api.users.me["data-exports"].$post()

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSuccess: (latest) => {
      queryClient.setQueryData(myDataExportQueryOptions.queryKey, (state) => ({
        latest,
        nextRequestAt: state?.nextRequestAt ?? null,
      }))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: myDataExportQueryOptions.queryKey }),
  })
}

export function useDownloadDataExport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.users.me["data-exports"][":id"].download.$post({ param: { id } })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSuccess: ({ url }) => {
      window.location.assign(url)
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === "DATA_EXPORT_NOT_READY") {
        void queryClient.invalidateQueries({ queryKey: myDataExportQueryOptions.queryKey })
      }
    },
  })
}
