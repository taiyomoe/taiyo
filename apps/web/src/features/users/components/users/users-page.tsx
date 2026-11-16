import { Coins, Sparkles, User, UserRemove, Users } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { UserDialog } from "@/features/users/components/users/user-dialogs"
import {
  FilterSearch,
  FilterSelect,
  FilterToggle,
  FilterToolbar,
} from "@/components/filters/filter-toolbar"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import { BulkBar } from "@/features/catalog/components/shared/bulk-bar"
import {
  SkeletonActions,
  SkeletonMediaCell,
  SkeletonPill,
  SkeletonText,
} from "@/features/catalog/components/shared/catalog-skeletons"
import {
  CatalogFooter,
  CatalogTable,
  VisuallyHidden,
} from "@/features/catalog/components/shared/catalog-table"
import { useSelection } from "@/features/catalog/hooks/use-selection"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { formatNumber } from "@/features/dashboard/lib/format"
import {
  USERS_PER_PAGE,
  type UsersFilter,
  useUnbanUser,
  usersQueryOptions,
} from "@/features/users/api/users"
import { UserDialogs } from "@/features/users/components/users/user-dialogs"
import { UserRow } from "@/features/users/components/users/user-row"
import { ROLE_OPTIONS } from "@/features/users/lib/role-labels"
import { getErrorMessage } from "@/lib/errors"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/users")

export function UsersPage() {
  const { session } = routeApi.useRouteContext()
  const params = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const can = getPermissions(session.user)
  const filter: UsersFilter = {
    search: params.q,
    role: params.role,
    banned: params.banned,
    page: params.page ?? 1,
  }
  const { data, isPlaceholderData } = useQuery(usersQueryOptions(useDeferredValue(filter)))
  const unban = useUnbanUser()
  const [dialog, setDialog] = useState<UserDialog | null>(null)
  const isAdmin = can("user.setRole", { id: "" })
  const selection = useSelection(data?.data.map((user) => user.id) ?? [])
  const bulk = (kind: UserDialog["kind"]) => () => {
    setDialog({
      kind,
      users: data?.data.filter((user) => selection.has(user.id)) ?? [],
      bulk: true,
    })
  }
  const update = (patch: Partial<UsersFilter>) => {
    const next = { ...filter, ...patch, page: patch.page ?? 1 }

    void navigate({
      replace: true,
      search: {
        q: next.search,
        role: next.role,
        banned: next.banned === true ? true : undefined,
        page: next.page === 1 ? undefined : next.page,
      },
    })
  }

  return (
    <DashboardPage
      subtitle={isAdmin ? m.users_subtitle_admin() : m.users_subtitle()}
      title={isAdmin ? m.users_title_admin() : m.dashboard_nav_users()}
    >
      <CatalogTable
        columns={[
          {
            key: "user",
            label: m.users_column_user(),
            skeleton: (
              <SkeletonMediaCell narrow={{ from: "3xl", content: "pills" }} thumb="avatar" />
            ),
          },
          {
            key: "role",
            label: m.users_role(),
            width: catalogStyles.colWide,
            from: "3xl",
            skeleton: <SkeletonPill width="6.5rem" />,
          },
          {
            key: "status",
            label: m.users_column_status(),
            width: catalogStyles.colMedium,
            from: "4xl",
            skeleton: <SkeletonPill />,
          },
          {
            key: "points",
            label: m.users_column_points(),
            width: catalogStyles.colNarrow,
            from: "4xl",
            skeleton: <SkeletonText width="3rem" />,
          },
          {
            key: "joined",
            label: m.users_joined(),
            width: catalogStyles.colMedium,
            from: "4xl",
            skeleton: <SkeletonText width="5.5rem" />,
          },
          {
            key: "actions",
            label: <VisuallyHidden>{m.catalog_column_actions()}</VisuallyHidden>,
            width: catalogStyles.colActions,
            skeleton: <SkeletonActions />,
          },
        ]}
        empty={
          data?.data.length === 0
            ? {
                icon: User,
                title: m.users_empty_title(),
                description: m.users_empty_description(),
              }
            : null
        }
        bulkBar={
          <BulkBar count={selection.ids.length} onClear={selection.clear}>
            {isAdmin ? (
              <Button onClick={bulk("role")} variant="outline">
                <Users />
                {m.users_role()}
              </Button>
            ) : null}
            {can("user.grant") ? (
              <>
                <Button onClick={bulk("points")} variant="outline">
                  <Coins />
                  {m.users_column_points()}
                </Button>
                <Button onClick={bulk("cosmetic")} variant="outline">
                  <Sparkles />
                  {m.users_cosmetic()}
                </Button>
              </>
            ) : null}
          </BulkBar>
        }
        fetching={isPlaceholderData}
        footer={
          data === undefined ? null : (
            <CatalogFooter total={m.catalog_results({ count: formatNumber(data.meta.total) })}>
              <PagePagination
                fit="container"
                onJump={(page) => {
                  update({ page })
                }}
                page={filter.page}
                pageCount={Math.ceil(data.meta.total / USERS_PER_PAGE)}
                renderLink={(page) => (
                  <Link
                    search={{
                      q: filter.search,
                      role: filter.role,
                      banned: filter.banned,
                      page: page === 1 ? undefined : page,
                    }}
                    to="/dashboard/users"
                  />
                )}
              />
            </CatalogFooter>
          )
        }
        loading={data === undefined}
        selection={isAdmin || can("user.grant") ? selection : undefined}
        toolbar={
          <FilterToolbar>
            <FilterSearch
              label={m.users_search()}
              onChange={(search) => {
                update({ search })
              }}
              value={filter.search}
            />
            <FilterSelect
              allLabel={m.users_all_roles()}
              label={m.users_role()}
              onChange={(role) => {
                update({ role })
              }}
              options={ROLE_OPTIONS}
              value={filter.role}
            />
            <FilterToggle
              icon={UserRemove}
              label={m.users_only_banned()}
              onChange={(banned) => {
                update({ banned })
              }}
              pressed={filter.banned === true}
            />
          </FilterToolbar>
        }
      >
        {data?.data.map((user) => (
          <UserRow
            can={can}
            key={user.id}
            onDialog={(kind) => {
              setDialog({ kind, users: [user], bulk: false })
            }}
            onUnban={() => {
              unban.mutate(user.id, {
                onSuccess: () => {
                  toastManager.add({
                    title: m.users_unbanned({ name: user.displayUsername }),
                    type: "success",
                  })
                },
                onError: (error) => {
                  toastManager.add({ title: getErrorMessage(error), type: "error" })
                },
              })
            }}
            selection={isAdmin || can("user.grant") ? selection : undefined}
            self={user.id === session.user.id}
            unbanning={unban.isPending && unban.variables === user.id}
            user={user}
          />
        ))}
      </CatalogTable>
      <UserDialogs
        dialog={dialog}
        onBulkDone={selection.clear}
        onClose={() => {
          setDialog(null)
        }}
        selfId={session.user.id}
      />
    </DashboardPage>
  )
}
