import type { Permissions } from "@taiyomoe/permissions"
import { User } from "@taiyomoe/ui/components/icons"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import type { ManagedUser } from "@/features/users/api/users"
import { ListCard } from "@/components/layout/dashboard-page"
import { UserRow } from "@/features/users/components/users/user-row"
import { m } from "@/paraglide/messages"

type UsersListProps = {
  users: ManagedUser[] | undefined
  can: Permissions
  selfId: string
  onBan: (user: ManagedUser) => void
}

export function UsersList({ users, can, selfId, onBan }: UsersListProps) {
  if (users === undefined || users.length > 0) {
    return (
      <ListCard>
        {(users ?? []).map((row) => (
          <UserRow can={can} key={row.id} onBan={onBan} self={row.id === selfId} user={row} />
        ))}
      </ListCard>
    )
  }

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <User />
        </EmptyMedia>
        <EmptyTitle>{m.users_empty_title()}</EmptyTitle>
        <EmptyDescription>{m.users_empty_description()}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
