import * as stylex from "@stylexjs/stylex"
import { type Permissions, ROLES, type Role } from "@taiyomoe/permissions"
import { Search, User } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { Field, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { Session } from "@/lib/queries/session"
import { AuthAlert } from "@/components/auth/auth-alert"
import { TimeAgo } from "@/components/chapters/chapter-meta"
import { DashboardPage, ListCard, ListRow } from "@/components/dashboard/dashboard-page"
import { PersonAvatar } from "@/components/groups/group-avatar"
import { PagePagination } from "@/components/pagination/page-pagination"
import { getErrorMessage } from "@/lib/errors"
import { getPermissions } from "@/lib/permissions"
import {
  type ManagedUser,
  USERS_PER_PAGE,
  type UsersFilter,
  useBanUser,
  usersQueryOptions,
  useSetUserRole,
  useUnbanUser,
} from "@/lib/queries/users"
import { m } from "@/paraglide/messages"

const ROLE_LABELS: Record<Role, () => string> = {
  USER: m.role_user,
  MODERATOR: m.role_moderator,
  UPLOADER_INTERN: m.role_uploader_intern,
  UPLOADER: m.role_uploader,
  ADMIN: m.role_admin,
}
const ALL = "ALL"
const BAN_LENGTHS = [
  { value: "1", days: 1, label: m.ban_length_day },
  { value: "7", days: 7, label: m.ban_length_week },
  { value: "30", days: 30, label: m.ban_length_month },
  { value: "365", days: 365, label: m.ban_length_year },
  { value: "forever", days: null, label: m.ban_length_forever },
] as const
const styles = stylex.create({
  filters: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  search: {
    flexGrow: 1,
    maxWidth: "24rem",
    minWidth: "14rem",
  },
  filter: {
    width: "11rem",
  },
  main: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  titleLine: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  name: {
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  meta: {
    gap: "0.75rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
  },
  reason: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    fontStyle: "italic",
    overflowWrap: "anywhere",
  },
  actions: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
  },
  role: {
    display: "flex",
    justifyContent: "flex-end",
    width: "11rem",
  },
  banSlot: {
    display: "flex",
    justifyContent: "flex-end",
    width: "5.5rem",
  },
  dialogBody: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
})
const formatDate = (value: string) => value.slice(0, 10)

function RoleControl({ user, can, self }: { user: ManagedUser; can: Permissions; self: boolean }) {
  const setRole = useSetUserRole()

  if (self || !can("user.setRole", { id: user.id, role: user.role })) {
    return (
      <div sx={styles.role}>
        <Badge variant="outline">{ROLE_LABELS[user.role]()}</Badge>
      </div>
    )
  }

  return (
    <div sx={styles.role}>
      <Select
        disabled={setRole.isPending}
        onValueChange={(role) => {
          if (role !== null && role !== user.role) {
            setRole.mutate({ userId: user.id, role })
          }
        }}
        value={user.role}
      >
        <SelectTrigger aria-label={m.users_role()} size="sm">
          <SelectValue>{() => ROLE_LABELS[user.role]()}</SelectValue>
        </SelectTrigger>
        <SelectPopup>
          {ROLES.map((role) => (
            <SelectItem key={role} value={role}>
              {ROLE_LABELS[role]()}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </div>
  )
}

function BanDialog({ user, onClose }: { user: ManagedUser | null; onClose: () => void }) {
  const ban = useBanUser()
  const [reason, setReason] = useState("")
  const [length, setLength] = useState<(typeof BAN_LENGTHS)[number]["value"]>("7")
  const [touched, setTouched] = useState(false)
  const selected = BAN_LENGTHS.find((option) => option.value === length) ?? BAN_LENGTHS[1]
  const close = () => {
    setReason("")
    setTouched(false)
    ban.reset()
    onClose()
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          close()
        }
      }}
      open={user !== null}
    >
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{m.users_ban_title({ name: user?.displayUsername ?? "" })}</DialogTitle>
          <DialogDescription>{m.users_ban_description()}</DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div sx={styles.dialogBody}>
            <AuthAlert message={ban.isError ? getErrorMessage(ban.error) : null} />
            <Field invalid={touched && reason.trim() === ""}>
              <FieldLabel>{m.users_ban_reason()}</FieldLabel>
              <Textarea
                maxLength={2000}
                onChange={(event) => {
                  setReason(event.target.value)
                }}
                placeholder={m.users_ban_reason_placeholder()}
                rows={3}
                value={reason}
              />
              {touched && reason.trim() === "" ? (
                <FieldError match>{m.users_ban_reason_required()}</FieldError>
              ) : null}
            </Field>
            <Field>
              <FieldLabel>{m.users_ban_length()}</FieldLabel>
              <Select
                onValueChange={(next) => {
                  if (next !== null) {
                    setLength(next)
                  }
                }}
                value={length}
              >
                <SelectTrigger aria-label={m.users_ban_length()}>
                  <SelectValue>{() => selected.label()}</SelectValue>
                </SelectTrigger>
                <SelectPopup>
                  {BAN_LENGTHS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label()}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </Field>
          </div>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
          <Button
            disabled={ban.isPending}
            onClick={() => {
              setTouched(true)

              if (user !== null && reason.trim() !== "") {
                ban.mutate(
                  { userId: user.id, reason: reason.trim(), days: selected.days },
                  { onSuccess: close },
                )
              }
            }}
            variant="destructive"
          >
            {m.users_ban()}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}

function UserRow({
  user,
  can,
  self,
  onBan,
}: {
  user: ManagedUser
  can: Permissions
  self: boolean
  onBan: (user: ManagedUser) => void
}) {
  const unban = useUnbanUser()
  const canBan = can("user.ban", { id: user.id, role: user.role })

  return (
    <ListRow>
      <PersonAvatar person={user} />
      <div sx={styles.main}>
        <div sx={styles.titleLine}>
          <span sx={styles.name}>{user.displayUsername}</span>
          {user.banned ? (
            <Badge variant="error">
              {user.banExpires === null
                ? m.users_banned()
                : m.users_banned_until({ date: formatDate(user.banExpires) })}
            </Badge>
          ) : null}
        </div>
        <div sx={styles.meta}>
          <span>@{user.username}</span>
          {user.email === null ? null : <span>{user.email}</span>}
          <span>
            {m.users_joined()} <TimeAgo date={user.createdAt} />
          </span>
        </div>
        {user.banned && user.banReason !== null ? (
          <p sx={styles.reason}>{m.users_ban_reason_shown({ reason: user.banReason })}</p>
        ) : null}
      </div>
      <div sx={styles.actions}>
        <RoleControl can={can} self={self} user={user} />
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
      </div>
    </ListRow>
  )
}

export function UsersPage({ filter, user }: { filter: UsersFilter; user: Session["user"] }) {
  const can = getPermissions(user)
  const navigate = useNavigate({ from: "/dashboard/users" })
  const [input, setInput] = useState(filter.search ?? "")
  const deferred = useDeferredValue(filter)
  const { data } = useQuery({
    ...usersQueryOptions(deferred),
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
      <div sx={styles.filters}>
        <div sx={styles.search}>
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              aria-label={m.users_search()}
              onChange={(event) => {
                setInput(event.target.value)
                update({
                  search: event.target.value.trim() === "" ? undefined : event.target.value.trim(),
                })
              }}
              placeholder={m.users_search()}
              value={input}
            />
          </InputGroup>
        </div>
        <div sx={styles.filter}>
          <Select
            onValueChange={(next) => {
              update({ role: ROLES.find((role) => role === next) })
            }}
            value={filter.role ?? ALL}
          >
            <SelectTrigger aria-label={m.users_role()}>
              <SelectValue>
                {() =>
                  filter.role === undefined ? m.users_all_roles() : ROLE_LABELS[filter.role]()
                }
              </SelectValue>
            </SelectTrigger>
            <SelectPopup>
              <SelectItem value={ALL}>{m.users_all_roles()}</SelectItem>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {ROLE_LABELS[role]()}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </div>
        <Button
          aria-pressed={filter.banned === true}
          onClick={() => {
            update({ banned: filter.banned === true ? undefined : true })
          }}
          variant={filter.banned === true ? "secondary" : "outline"}
        >
          {m.users_only_banned()}
        </Button>
      </div>
      {data === undefined || data.data.length > 0 ? (
        <ListCard>
          {(data?.data ?? []).map((row) => (
            <UserRow
              can={can}
              key={row.id}
              onBan={setBanning}
              self={row.id === user.id}
              user={row}
            />
          ))}
        </ListCard>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <User />
            </EmptyMedia>
            <EmptyTitle>{m.users_empty_title()}</EmptyTitle>
            <EmptyDescription>{m.users_empty_description()}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
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
