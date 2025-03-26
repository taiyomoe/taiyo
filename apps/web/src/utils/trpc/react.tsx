"use client"

import type { AppRouter } from "@taiyomoe/trpc"
import type { QueryClient } from "@tanstack/react-query"
import { QueryClientProvider } from "@tanstack/react-query"
import { createTRPCClient, httpBatchStreamLink, loggerLink } from "@trpc/client"
import { createTRPCContext } from "@trpc/tanstack-react-query"
import { useState } from "react"
import SuperJSON from "superjson"
import { env } from "~/env"
import type { ProviderProps } from "~/utils/types"
import { createQueryClient } from "./query-client"

let clientQueryClientSingleton: QueryClient | undefined = undefined

const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin
  if (env.BETTER_AUTH_URL) return env.BETTER_AUTH_URL

  return `http://localhost:${process.env.PORT ?? 3000}`
}

const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient()
  }

  // Browser: use singleton pattern to keep the same query client
  if (!clientQueryClientSingleton) {
    clientQueryClientSingleton = createQueryClient()
  }

  return clientQueryClientSingleton
}

export const TRPCReactProvider = ({ children }: ProviderProps) => {
  const queryClient = getQueryClient()
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (op) =>
            env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchStreamLink({
          transformer: SuperJSON,
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            const headers = new Headers()
            headers.set("x-trpc-source", "nextjs-react")
            return headers
          },
        }),
      ],
    }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}

export const { useTRPC, TRPCProvider } = createTRPCContext<AppRouter>()
