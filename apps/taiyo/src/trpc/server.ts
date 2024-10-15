import { auth } from "@taiyomoe/auth"
import { type AppRouter, createCaller, createTRPCContext } from "@taiyomoe/trpc"
import { createHydrationHelpers } from "@trpc/react-query/rsc"
import { headers } from "next/headers"
import { cache } from "react"
import { createQueryClient } from "./query-client"

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(headers())
  heads.set("x-trpc-source", "rsc")

  return createTRPCContext({
    session: await auth(),
    headers: heads,
  })
})

const getQueryClient = cache(createQueryClient)
const caller = createCaller(createContext)

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
)
