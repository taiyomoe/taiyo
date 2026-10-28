import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ManagedUser } from "@/features/users/api/users"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  banSlot: {
    display: "flex",
    justifyContent: "flex-end",
    width: "5.5rem",
  },
})

export function UserBanActions({
  user,
  canBan,
  onBan,
}: {
  user: ManagedUser
  canBan: boolean
  onBan: (user: ManagedUser) => void
}) {
  const queryClient = useQueryClient()
  const unban = useMutation({
    mutationFn: async (userId: string) =>
      ensureSuccess(await api.users[":id"].unban.$post({ param: { id: userId } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })

  return (
    <div sx={styles.banSlot}>
      {canBan && user.banned ? (
        <Button
          disabled={unban.isPending}
          onClick={() => {
            unban.mutate(user.id)
          }}
          size="sm"
          variant="outline"
        >
          {m.users_unban()}
        </Button>
      ) : null}
      {canBan && !user.banned ? (
        <Button
          onClick={() => {
            onBan(user)
          }}
          size="sm"
          variant="ghost"
        >
          {m.users_ban()}
        </Button>
      ) : null}
    </div>
  )
}
