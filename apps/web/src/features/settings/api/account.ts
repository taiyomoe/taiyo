import type { InferRequestType } from "hono/client"
import { authClient } from "@taiyomoe/auth/client"
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { unwrapAuth } from "@/features/users/api/user-admin"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"
import { sessionQueryOptions } from "@/lib/session"

export const myAccountsQueryOptions = queryOptions({
  queryKey: ["settings", "accounts"],
  queryFn: () => unwrapAuth(authClient.listAccounts()),
})

export const mySessionsQueryOptions = queryOptions({
  queryKey: ["settings", "sessions"],
  queryFn: () => unwrapAuth(authClient.listSessions()),
})

// The shell reads the session from the router context, a snapshot taken when
// the route loaded: drop it and re-run the route so every consumer sees the change.
export function useReloadSession() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return async () => {
    queryClient.removeQueries({ queryKey: sessionQueryOptions.queryKey })
    await router.invalidate()
    await queryClient.invalidateQueries({ queryKey: ["settings"] })
  }
}

type AccountPatch = InferRequestType<(typeof api.users.me.account)["$patch"]>["json"]

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  const reloadSession = useReloadSession()

  return useMutation({
    mutationFn: async (patch: AccountPatch) => {
      const response = await api.users.me.account.$patch({ json: patch })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSuccess: async () => {
      await reloadSession()
      await queryClient.invalidateQueries({ queryKey: ["users", "profile"] })
    },
  })
}

export function useSetPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newPassword: string) => {
      const response = await api.users.me.password.$post({ json: { newPassword } })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: myAccountsQueryOptions.queryKey }),
  })
}

export function useChangePassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: {
      currentPassword: string
      newPassword: string
      revokeOtherSessions: boolean
    }) => unwrapAuth(authClient.changePassword(body)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mySessionsQueryOptions.queryKey }),
  })
}

// Absolute: Better Auth resolves a relative callbackURL against the api's origin.
const accountSettingsURL = () => new URL("/settings?tab=account", window.location.origin).href

export function useChangeEmail() {
  return useMutation({
    mutationFn: (newEmail: string) =>
      unwrapAuth(authClient.changeEmail({ newEmail, callbackURL: accountSettingsURL() })),
  })
}

export function useLinkAccount() {
  return useMutation({
    mutationFn: (provider: "discord" | "google") =>
      unwrapAuth(authClient.linkSocial({ provider, callbackURL: accountSettingsURL() })),
  })
}

export function useUnlinkAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (account: { providerId: string; accountId: string }) =>
      unwrapAuth(authClient.unlinkAccount(account)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: myAccountsQueryOptions.queryKey }),
  })
}

export function useRevokeSessions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (token: string | null) =>
      unwrapAuth(
        token === null ? authClient.revokeOtherSessions() : authClient.revokeSession({ token }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mySessionsQueryOptions.queryKey }),
  })
}
