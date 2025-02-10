import { Button } from "@nextui-org/react"
import { authClient } from "@taiyomoe/auth/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { Session } from "better-auth"
import type { BetterFetchResponse } from "better-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/generics/data-table/table"
import { TableCellDate } from "~/components/tables/table-cell-date"
import { TableCellLong } from "~/components/tables/table-cell-long"

type Props = {
  sessions: Session[]
}

export const UserSettingsSessionTable = ({ sessions }: Props) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()
  const { mutateAsync } = useMutation({
    mutationKey: ["revoke-session"],
    mutationFn: (token: string) => authClient.revokeSession({ token }),
    onSuccess: (_, token) => {
      queryClient.setQueryData(
        ["get-sessions"],
        (prev: NonNullable<BetterFetchResponse<Session[]>>) => {
          const newData = prev.data?.filter((s) => s.token !== token) ?? []

          // The user just logged himself out.
          if (session?.session.token === token) {
            router.push("/")
          }

          return { ...prev, data: newData }
        },
      )
    },
  })

  const handlePress = (token: string) => () => {
    toast.promise(mutateAsync(token), {
      loading: "Desativando a sessão...",
      success: "Sessão desativada com sucesso!",
      error: (err) => {
        console.error(err)
        return "Ocorreu um erro inesperado ao desativar a sessão"
      },
    })
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data de criação</TableHead>
          <TableHead className="!text-center">Data de expiração</TableHead>
          <TableHead>User-Agent</TableHead>
          <TableHead>IP</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <TableRow key={session.id}>
            <TableCell>
              <TableCellDate date={session.createdAt} />
            </TableCell>
            <TableCell>
              <TableCellDate date={session.expiresAt} />
            </TableCell>
            <TableCell>
              <TableCellLong text={session.userAgent ?? ""} />
            </TableCell>
            <TableCell>{session.ipAddress}</TableCell>
            <TableCell>
              <Button onPress={handlePress(session.token)} size="sm">
                Desativar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
