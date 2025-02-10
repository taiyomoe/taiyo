import { authClient } from "@taiyomoe/auth/client"
import { useQuery } from "@tanstack/react-query"
import { UserSettingsSessionTable } from "./user-settings-sessions-table"

export const UserSettingsSessions = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["get-sessions"],
    queryFn: () => authClient.listSessions(),
    select: ({ data }) => data,
  })

  if (isLoading || !data) return <p>Loading...</p>

  return (
    <div className="w-full space-y-4 overflow-auto">
      <p className="font-medium text-xl">Sessões ativas</p>
      <UserSettingsSessionTable sessions={data} />
    </div>
  )
}
