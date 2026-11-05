import { authClient } from "@taiyomoe/auth/client"
import { useMutation } from "@tanstack/react-query"
import { useReloadSession } from "@/features/settings/api/account"
import { unwrapAuth } from "@/features/users/api/user-admin"

const issuer = "Taiyō"

export function useEnableTwoFactor() {
  return useMutation({
    mutationFn: (password: string | undefined) =>
      unwrapAuth(
        authClient.twoFactor.enable({ issuer, ...(password === undefined ? {} : { password }) }),
      ),
  })
}

export function useVerifyTotp() {
  const reloadSession = useReloadSession()

  return useMutation({
    mutationFn: (code: string) => unwrapAuth(authClient.twoFactor.verifyTotp({ code })),
    onSuccess: reloadSession,
  })
}

export function useDisableTwoFactor() {
  const reloadSession = useReloadSession()

  return useMutation({
    mutationFn: (password: string | undefined) =>
      unwrapAuth(authClient.twoFactor.disable(password === undefined ? {} : { password })),
    onSuccess: reloadSession,
  })
}

export function useGenerateBackupCodes() {
  return useMutation({
    mutationFn: (password: string | undefined) =>
      unwrapAuth(
        authClient.twoFactor.generateBackupCodes(password === undefined ? {} : { password }),
      ),
  })
}
