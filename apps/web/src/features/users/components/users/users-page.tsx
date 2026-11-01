import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import { type ManagedUser, USERS_PER_PAGE, type UsersFilter } from "@/features/users/api/users"
import { BanDialog } from "@/features/users/components/users/ban-dialog"
import { UsersFilters } from "@/features/users/components/users/users-filters"
import { UsersList } from "@/features/users/components/users/users-list"
import { api } from "@/lib/api"
import { unwrapEnvelope } from "@/lib/envelope"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/users")

export function UsersPage() {
  const { session } = routeApi.useRouteContext()
  const params = routeApi.useSearch()
  const { user } = session
  const filter: UsersFilter = {
    search: params.q,
    role: params.role,
    banned: params.banned,
    page: params.page ?? 1,
  }
  const can = getPermissions(user)
  const navigate = routeApi.useNavigate()
  const deferred = useDeferredValue(filter)
  const { data } = useQuery({
    queryKey: [
      "users",
      "list",
      {
        search: deferred.search,
        role: deferred.role,
        banned: deferred.banned,
        page: deferred.page,
      },
    ],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.users.$get(
          {
            query: {
              page: String(deferred.page),
              perPage: String(USERS_PER_PAGE),
              ...(deferred.search === undefined ? {} : { search: deferred.search }),
              ...(deferred.role === undefined ? {} : { role: deferred.role }),
              ...(deferred.banned === undefined
                ? {}
                : { banned: deferred.banned ? "true" : "false" }),
            },
          },
          { init: { signal } },
        ),
      ),
    placeholderData: (previous) => previous,
  })
  const [banning, setBanning] = useState<ManagedUser | null>(null)
  const isAdmin = can("user.setRole", { id: "", role: "USER" })
  const update = (patch: Partial<UsersFilter>) => {
    const next = { ...filter, ...patch, page: patch.page ?? 1 }

    void navigate({
      replace: true,
      search: {
        q: next.search,
        role: next.role,
        banned: next.banned,
        page: next.page === 1 ? undefined : next.page,
      },
    })
  }

  return (
    <DashboardPage
      subtitle={isAdmin ? m.users_subtitle_admin() : m.users_subtitle()}
      title={isAdmin ? m.users_title_admin() : m.dashboard_nav_users()}
    >
      <UsersFilters filter={filter} onChange={update} />
      <UsersList can={can} onBan={setBanning} selfId={user.id} users={data?.data} />
      {data === undefined ? null : (
        <PagePagination
          onJump={(target) => {
            update({ page: target })
          }}
          page={filter.page}
          pageCount={Math.ceil(data.meta.total / USERS_PER_PAGE)}
          renderLink={(target) => (
            <Link
              search={(previous) => ({ ...previous, page: target === 1 ? undefined : target })}
              to="/dashboard/users"
            />
          )}
        />
      )}
      <BanDialog
        onClose={() => {
          setBanning(null)
        }}
        user={banning}
      />
    </DashboardPage>
  )
}
