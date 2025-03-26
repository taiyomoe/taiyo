import { type AppRouter, appRouter, createTRPCContext } from "@taiyomoe/trpc"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import type { TRPCQueryOptions } from "@trpc/tanstack-react-query"
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"
import { headers } from "next/headers"
import { cache } from "react"
import { getSession } from "~/utils/get-session"
import type { ProviderProps } from "~/utils/types"
import { createQueryClient } from "./query-client"

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers())
  heads.set("x-trpc-source", "rsc")

  return createTRPCContext({
    session: await getSession(),
    headers: heads,
  })
})

const getQueryClient = cache(createQueryClient)

export const trpc = createTRPCOptionsProxy<AppRouter>({
  router: appRouter,
  ctx: createContext,
  queryClient: getQueryClient,
})

export const HydrateClient = ({ children }: ProviderProps) => {
  const queryClient = getQueryClient()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  )
}

// biome-ignore lint/suspicious/noExplicitAny: it's fine, the result of this function is never used
export const prefetch = <T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) => {
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(queryOptions)
}
