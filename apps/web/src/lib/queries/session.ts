import { authClient } from "@taiyomoe/auth/client"
import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequestHeader } from "@tanstack/react-start/server"
import { queryOptions } from "@tanstack/react-query"

export type Session = typeof authClient.$Infer.Session

const getSession = createIsomorphicFn()
  .server(() =>
    authClient.getSession({
      fetchOptions: { headers: { cookie: getRequestHeader("cookie") ?? "" } },
    }),
  )
  .client(() => authClient.getSession())

export const sessionQueryOptions = queryOptions({
  queryKey: ["session"],
  queryFn: async () => (await getSession()).data ?? null,
})
