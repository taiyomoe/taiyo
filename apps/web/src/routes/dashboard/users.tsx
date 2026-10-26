import * as stylex from "@stylexjs/stylex"
import { authClient } from "@taiyomoe/auth/client"
import { config } from "@taiyomoe/config"
import { type Permissions, ROLES, type Role } from "@taiyomoe/permissions"
import { Ellipsis, Eye, Key, Monitor, Search, User } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
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
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@taiyomoe/ui/components/ui/menu"
import { PasswordInput } from "@taiyomoe/ui/components/ui/password-input"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import { z } from "zod"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { DashboardPage, ListCard, ListRow } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import { TimeAgo } from "@/features/chapters/components/chapter-meta"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { sessionsKey, unwrapAuth, userSessionsQueryOptions } from "@/features/users/api/user-admin"
import { type ManagedUser, USERS_PER_PAGE, type UsersFilter } from "@/features/users/api/users"
import { describeUserAgent } from "@/features/users/lib/user-agent"
import { useNow } from "@/hooks/use-now"
import { api } from "@/lib/api"
import { ensureSuccess, unwrapEnvelope } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { getPermissions } from "@/lib/permissions"
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
  moreSlot: {
    display: "flex",
    justifyContent: "flex-end",
    width: "2rem",
  },
  dialogBody: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
})
const adminStyles = stylex.create({
  sessions: {
    margin: 0,
    padding: 0,
    gap: "0.5rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  session: {
    padding: "0.75rem",
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
  },
  sessionIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  sessionMain: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  sessionTitle: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    fontWeight: 600,
  },
  sessionMeta: {
    gap: "0.75rem",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.8125rem",
  },
  muted: {
    margin: 0,
    color: colors.mutedForeground,
  },
  form: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  check: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.875rem",
  },
})
const iso = (value: string | Date) => new Date(value).toISOString()

type Dialogs = "impersonate" | "sessions" | "password" | null

const searchSchema = z.object({
  q: z.string().trim().min(1).max(100).optional().catch(undefined),
  role: z.enum(ROLES).optional().catch(undefined),
  banned: z.boolean().optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/users")({
  head: () => ({ meta: [{ title: m.users_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("user.list")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: function Users() {
    const { session } = Route.useRouteContext()
    const params = Route.useSearch()
    const { user } = session
    const filter: UsersFilter = {
      search: params.q,
      role: params.role,
      banned: params.banned,
      page: params.page ?? 1,
    }
    const can = getPermissions(user)
    const navigate = useNavigate({ from: "/dashboard/users" })
    const [input, setInput] = useState(filter.search ?? "")
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
    const queryClient = useQueryClient()
    const ban = useMutation({
      mutationFn: async ({
        userId,
        reason: banReason,
        days,
      }: {
        userId: string
        reason: string
        days: number | null
      }) =>
        ensureSuccess(
          await api.users[":id"].ban.$post({
            param: { id: userId },
            json: { reason: banReason, days },
          }),
        ),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    })
    const [reason, setReason] = useState("")
    const [length, setLength] = useState<(typeof BAN_LENGTHS)[number]["value"]>("7")
    const [touched, setTouched] = useState(false)
    const selected = BAN_LENGTHS.find((option) => option.value === length) ?? BAN_LENGTHS[1]
    const close = () => {
      setReason("")
      setTouched(false)
      ban.reset()
      setBanning(null)
    }
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
                    search:
                      event.target.value.trim() === "" ? undefined : event.target.value.trim(),
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
        <Dialog
          onOpenChange={(open) => {
            if (!open) {
              close()
            }
          }}
          open={banning !== null}
        >
          <DialogPopup>
            <DialogHeader>
              <DialogTitle>
                {m.users_ban_title({ name: banning?.displayUsername ?? "" })}
              </DialogTitle>
              <DialogDescription>{m.users_ban_description()}</DialogDescription>
            </DialogHeader>
            <DialogPanel>
              <div sx={styles.dialogBody}>
                <ErrorAlert message={ban.isError ? getErrorMessage(ban.error) : null} />
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

                  if (banning !== null && reason.trim() !== "") {
                    ban.mutate(
                      { userId: banning.id, reason: reason.trim(), days: selected.days },
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
      </DashboardPage>
    )
  },
})

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
  const queryClient = useQueryClient()
  const setRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) =>
      ensureSuccess(await api.users[":id"].role.$patch({ param: { id: userId }, json: { role } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })
  const unban = useMutation({
    mutationFn: async (userId: string) =>
      ensureSuccess(await api.users[":id"].unban.$post({ param: { id: userId } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })
  const canBan = can("user.ban", { id: user.id, role: user.role })
  const impersonate = useMutation({
    mutationFn: (userId: string) => unwrapAuth(authClient.admin.impersonateUser({ userId })),
    onSuccess: () => {
      window.location.assign("/")
    },
  })
  const [open, setOpen] = useState<Dialogs>(null)
  const target = { id: user.id, role: user.role }
  const canImpersonate = can("user.impersonate", target) && !user.banned
  const canManageSessions = can("user.manageSessions", target)
  const canSetPassword = can("user.setPassword", target)
  const close = () => {
    setOpen(null)
  }

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
                : m.users_banned_until({ date: user.banExpires.slice(0, 10) })}
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
        {self || !can("user.setRole", { id: user.id, role: user.role }) ? (
          <div sx={styles.role}>
            <Badge variant="outline">{ROLE_LABELS[user.role]()}</Badge>
          </div>
        ) : (
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
        )}
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
        <div sx={styles.moreSlot}>
          {canImpersonate || canManageSessions || canSetPassword ? (
            <>
              <Menu>
                <MenuTrigger
                  render={
                    <Button
                      aria-label={m.user_admin_more({ name: user.displayUsername })}
                      size="icon-sm"
                      variant="ghost"
                    />
                  }
                >
                  <Ellipsis />
                </MenuTrigger>
                <MenuPopup align="end">
                  {canImpersonate ? (
                    <MenuItem
                      onClick={() => {
                        setOpen("impersonate")
                      }}
                    >
                      <Eye />
                      {m.user_admin_impersonate()}
                    </MenuItem>
                  ) : null}
                  {canManageSessions ? (
                    <MenuItem
                      onClick={() => {
                        setOpen("sessions")
                      }}
                    >
                      <Monitor />
                      {m.user_admin_sessions()}
                    </MenuItem>
                  ) : null}
                  {canSetPassword ? (
                    <MenuItem
                      onClick={() => {
                        setOpen("password")
                      }}
                    >
                      <Key />
                      {m.user_admin_set_password()}
                    </MenuItem>
                  ) : null}
                </MenuPopup>
              </Menu>
              <ConfirmDialog
                confirmation={
                  open === "impersonate"
                    ? {
                        title: m.impersonate_title({ name: user.displayUsername }),
                        description: m.impersonate_description(),
                        confirmLabel: m.impersonate_confirm({ name: user.displayUsername }),
                        run: () => impersonate.mutateAsync(user.id),
                      }
                    : null
                }
                error={impersonate.isError ? getErrorMessage(impersonate.error) : null}
                onClose={() => {
                  close()
                  impersonate.reset()
                }}
                pending={impersonate.isPending}
              />
              {open === "sessions" ? <SessionsDialog onClose={close} user={user} /> : null}
              {open === "password" ? <SetPasswordDialog onClose={close} user={user} /> : null}
            </>
          ) : null}
        </div>
      </div>
    </ListRow>
  )
}

function SessionsDialog({ user, onClose }: { user: ManagedUser; onClose: () => void }) {
  const sessions = useQuery(userSessionsQueryOptions(user.id))
  const queryClient = useQueryClient()
  const revoke = useMutation({
    mutationFn: (sessionToken: string | null) =>
      unwrapAuth(
        sessionToken === null
          ? authClient.admin.revokeUserSessions({ userId: user.id })
          : authClient.admin.revokeUserSession({ sessionToken }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sessionsKey(user.id) }),
  })
  const now = useNow()
  const active = (sessions.data ?? []).filter(
    (session) => new Date(session.expiresAt).getTime() > now,
  )

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open
    >
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{m.sessions_title({ name: user.displayUsername })}</DialogTitle>
          <DialogDescription>{m.sessions_description()}</DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div sx={adminStyles.form}>
            <ErrorAlert
              message={
                sessions.isError || revoke.isError
                  ? getErrorMessage(sessions.error ?? revoke.error)
                  : null
              }
            />
            {sessions.data === undefined ? (
              <p sx={adminStyles.muted}>{m.sessions_loading()}</p>
            ) : null}
            {sessions.data !== undefined && active.length === 0 ? (
              <p sx={adminStyles.muted}>{m.sessions_empty()}</p>
            ) : null}
            {active.length > 0 ? (
              <ul sx={adminStyles.sessions}>
                {active.map((session) => {
                  const device = describeUserAgent(session.userAgent)

                  return (
                    <li key={session.id} sx={adminStyles.session}>
                      <Monitor size={20} {...stylex.props(adminStyles.sessionIcon)} />
                      <div sx={adminStyles.sessionMain}>
                        <span sx={adminStyles.sessionTitle}>
                          {device === null
                            ? m.sessions_unknown_device()
                            : m.sessions_device(device)}
                          {typeof session.impersonatedBy === "string" ? (
                            <Badge variant="warning">{m.sessions_impersonation()}</Badge>
                          ) : null}
                        </span>
                        <span sx={adminStyles.sessionMeta}>
                          {session.ipAddress === null || session.ipAddress === undefined ? null : (
                            <span>{session.ipAddress}</span>
                          )}
                          <span>
                            {m.sessions_signed_in()} <TimeAgo date={iso(session.createdAt)} />
                          </span>
                          <span>
                            {m.sessions_expires()} <TimeAgo date={iso(session.expiresAt)} future />
                          </span>
                        </span>
                      </div>
                      <Button
                        disabled={revoke.isPending}
                        onClick={() => {
                          revoke.mutate(session.token)
                        }}
                        size="sm"
                        variant="outline"
                      >
                        {m.sessions_revoke()}
                      </Button>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
          <Button
            disabled={revoke.isPending || active.length === 0}
            onClick={() => {
              revoke.mutate(null)
            }}
            variant="destructive"
          >
            {m.sessions_revoke_all()}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}

function SetPasswordDialog({ user, onClose }: { user: ManagedUser; onClose: () => void }) {
  const queryClient = useQueryClient()
  const setPassword = useMutation({
    mutationFn: async ({
      userId,
      newPassword,
      signOut: revokeSessions,
    }: {
      userId: string
      newPassword: string
      signOut: boolean
    }) => {
      await unwrapAuth(authClient.admin.setUserPassword({ userId, newPassword }))

      if (revokeSessions) {
        await unwrapAuth(authClient.admin.revokeUserSessions({ userId }))
      }
    },
    onSuccess: (_data, { userId }) =>
      queryClient.invalidateQueries({ queryKey: sessionsKey(userId) }),
  })
  const [password, setPasswordValue] = useState("")
  const [signOut, setSignOut] = useState(true)
  const [touched, setTouched] = useState(false)
  const { minLength, maxLength } = config.auth.password
  const tooShort = password.length < minLength
  const invalid = touched && tooShort

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open
    >
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{m.set_password_title({ name: user.displayUsername })}</DialogTitle>
          <DialogDescription>{m.set_password_description()}</DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div sx={adminStyles.form}>
            <ErrorAlert message={setPassword.isError ? getErrorMessage(setPassword.error) : null} />
            <Field invalid={invalid}>
              <FieldLabel>{m.set_password_label()}</FieldLabel>
              <PasswordInput
                autoComplete="new-password"
                maxLength={maxLength}
                onBlur={() => {
                  setTouched(true)
                }}
                onChange={(event) => {
                  setPasswordValue(event.target.value)
                }}
                value={password}
              />
              {invalid ? (
                <FieldError match>{m.user_admin_password_short({ min: minLength })}</FieldError>
              ) : null}
            </Field>
            <label sx={adminStyles.check}>
              <Checkbox
                checked={signOut}
                onCheckedChange={(checked) => {
                  setSignOut(checked)
                }}
              />
              {m.set_password_sign_out()}
            </label>
          </div>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
          <Button
            disabled={setPassword.isPending}
            onClick={() => {
              setTouched(true)

              if (!tooShort) {
                setPassword.mutate(
                  { userId: user.id, newPassword: password, signOut },
                  { onSuccess: onClose },
                )
              }
            }}
          >
            {m.set_password_submit()}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
