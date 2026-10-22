import type { ErrorComponentProps } from "@tanstack/react-router"
import * as stylex from "@stylexjs/stylex"
import { Alert, AlertDescription, AlertTitle } from "@taiyomoe/ui/components/ui/alert"
import { Spinner } from "@taiyomoe/ui/components/ui/spinner"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { QueryClient } from "@tanstack/react-query"
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { getApiErrorCode } from "@/lib/envelope"
import { m } from "@/paraglide/messages"
import { routeTree } from "./routeTree.gen"

const styles = stylex.create({
  pending: {
    padding: "2rem",
    gap: "0.75rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    justifyContent: "center",
    minHeight: "12rem",
  },
  error: {
    padding: "2rem",
    display: "flex",
    justifyContent: "center",
  },
  errorAlert: {
    maxWidth: "32rem",
  },
})

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
  })
  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: function DefaultPendingComponent() {
      return (
        <div sx={styles.pending}>
          <Spinner />
          <span>{m.loading()}</span>
        </div>
      )
    },
    defaultErrorComponent: function DefaultErrorComponent({ error }: ErrorComponentProps) {
      const code = getApiErrorCode(error)
      const description = code === undefined ? m.error_unknown() : m.error_api_code({ code })

      return (
        <div sx={styles.error}>
          <Alert sx={styles.errorAlert} variant="error">
            <AlertTitle>{m.error_heading()}</AlertTitle>
            <AlertDescription>{description}</AlertDescription>
          </Alert>
        </div>
      )
    },
  })

  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

declare module "@tanstack/react-router" {
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
