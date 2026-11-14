import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import {
  Activity,
  BookOpenText,
  Check,
  CheckAll,
  ChevronRight,
  Close,
  Comment,
  Inbox,
  Mail,
  Search,
  Settings,
  Trash,
} from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import { Switch } from "@taiyomoe/ui/components/ui/switch"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link, Navigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { range } from "remeda"
import type { Session } from "@/lib/session"
import { layout } from "@/components/layout/layout.stylex"
import { PagePagination } from "@/components/pagination/page-pagination"
import { AppShell } from "@/components/shell/app-shell"
import {
  type Notification,
  type NotificationCategory,
  type NotificationCounts,
  notificationCountsQueryOptions,
  notificationsQueryOptions,
  useDeleteNotifications,
  useMarkAllNotificationsRead,
  useSetNotificationsRead,
} from "@/features/notifications/api/notifications"
import { NotificationEmpty } from "@/features/notifications/components/notification-empty"
import {
  NotificationRow,
  NotificationRowSkeleton,
} from "@/features/notifications/components/notification-row"
import {
  NOTIFY_SETTINGS,
  useBooleanSettings,
} from "@/features/notifications/lib/notification-settings"
import {
  NOTIFICATIONS_PER_PAGE,
  type NotificationsSearch,
} from "@/features/notifications/lib/pagination"
import { FollowListDialog } from "@/features/users/components/profile/dialogs/follow-list-dialog"
import { useClientValue } from "@/hooks/use-client-value"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const routeApi = getRouteApi("/notifications")
const SEARCH_DELAY_MS = 300
const NAV_ITEMS = [
  { category: undefined, label: m.notifications_category_all, icon: Inbox },
  { category: "chapters", label: m.notifications_category_chapters, icon: BookOpenText },
  { category: "replies", label: m.notifications_category_replies, icon: Comment },
  { category: "activity", label: m.notifications_category_activity, icon: Activity },
] as const satisfies ReadonlyArray<{
  category: NotificationCategory | undefined
  label: () => string
  icon: (props: IconProps) => ReactElement
}>
const ACCENT = `color-mix(in srgb, ${colors.primary} 78%, ${colors.foreground})`
const styles = stylex.create({
  page: {
    gap: { default: "1.25rem", [breakpoints.md]: "1.75rem" },
    marginInline: "auto",
    paddingInline: layout.gutter,
    display: "flex",
    flexDirection: "column",
    maxWidth: "76rem",
    paddingBottom: "4rem",
    paddingTop: { default: "1.5rem", [breakpoints.md]: "2.5rem" },
    width: "100%",
  },
  layout: {
    gap: { default: "1rem", [breakpoints.lg]: "2rem" },
    alignItems: "start",
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr)", [breakpoints.lg]: "17.5rem minmax(0, 1fr)" },
  },
  sidebar: {
    gap: "1rem",
    gridColumn: "1",
    gridRow: { default: "2", [breakpoints.lg]: "1 / span 2" },
    display: "flex",
    flexDirection: "column",
    position: { default: "static", [breakpoints.lg]: "sticky" },
    minWidth: 0,
    top: "calc(var(--navbar-height) + 1.5rem)",
  },
  main: {
    gap: "1.25rem",
    gridColumn: { default: "1", [breakpoints.lg]: "2" },
    gridRow: { default: "3", [breakpoints.lg]: "2" },
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  header: {
    gap: "1rem",
    gridColumn: { default: "1", [breakpoints.lg]: "2" },
    gridRow: "1",
    alignItems: "flex-end",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  heading: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  title: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: { default: "2rem", [breakpoints.md]: "2.75rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.05,
  },
  summary: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
    fontVariantNumeric: "tabular-nums",
  },
  headerActions: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
  },
  settingsButton: {
    display: { default: "inline-flex", [breakpoints.lg]: "none" },
  },
  card: {
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: colors.card,
  },
  nav: {
    padding: { default: 0, [breakpoints.lg]: "0.5rem" },
    borderColor: { default: "transparent", [breakpoints.lg]: colors.border },
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: { default: 0, [breakpoints.lg]: 1 },
    gap: { default: "0.375rem", [breakpoints.lg]: "0.125rem" },
    marginInline: { default: `calc(-1 * ${layout.gutter})`, [breakpoints.lg]: 0 },
    paddingInline: { default: layout.gutter, [breakpoints.lg]: "0.5rem" },
    backgroundColor: { default: "transparent", [breakpoints.lg]: colors.card },
    display: "flex",
    flexDirection: { default: "row", [breakpoints.lg]: "column" },
    scrollbarWidth: "none",
    overflowX: { default: "auto", [breakpoints.lg]: "visible" },
  },
  navItem: {
    borderColor: { default: colors.border, [breakpoints.lg]: "transparent" },
    borderRadius: { default: radius.full, [breakpoints.lg]: `calc(${radius.xxl} - 0.5rem - 1px)` },
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.625rem",
    paddingInline: { default: "0.875rem", [breakpoints.lg]: "calc(0.625rem - 1px)" },
    textDecoration: "none",
    alignItems: "center",
    backgroundColor: { default: "transparent", ":hover": colors.accent },
    color: colors.mutedForeground,
    display: "flex",
    flexShrink: 0,
    fontSize: "0.875rem",
    fontWeight: 550,
    outlineColor: colors.ring,
    outlineOffset: -2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    transitionDuration: "150ms",
    transitionProperty: "background-color, color, border-color",
    whiteSpace: "nowrap",
    height: { default: "2.25rem", [breakpoints.lg]: "2.5rem" },
  },
  navItemActive: {
    borderColor: {
      default: `color-mix(in srgb, ${colors.primary} 45%, transparent)`,
      [breakpoints.lg]: "transparent",
    },
    backgroundColor: `color-mix(in srgb, ${colors.primary} 13%, transparent)`,
    color: colors.foreground,
  },
  navIcon: {
    flexShrink: 0,
  },
  navIconActive: {
    color: colors.primary,
  },
  navLabel: {
    flexGrow: { default: 0, [breakpoints.lg]: 1 },
  },
  count: {
    borderRadius: radius.full,
    paddingInline: "0.375rem",
    alignItems: "center",
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
    display: "inline-flex",
    fontSize: "0.6875rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
    justifyContent: "center",
    lineHeight: 1,
    height: "1.25rem",
    minWidth: "1.25rem",
  },
  preferences: {
    padding: "1.125rem",
    display: { default: "none", [breakpoints.lg]: "flex" },
    flexDirection: "column",
  },
  preferencesTitle: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: "1.125rem",
    fontWeight: font.weightBold,
    lineHeight: 1.25,
  },
  preferencesDescription: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    marginTop: "0.25rem",
  },
  preferenceList: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    marginTop: "0.75rem",
  },
  preference: {
    gap: "0.625rem",
    paddingBlock: "0.5rem",
    alignItems: "center",
    cursor: "pointer",
    display: "flex",
    fontSize: "0.875rem",
  },
  preferenceIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  preferenceLabel: {
    flex: "1",
    minWidth: 0,
  },
  pushLink: {
    gap: "0.625rem",
    paddingBlock: "0.75rem",
    textDecoration: "none",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
    marginTop: "0.5rem",
  },
  pushText: {
    flex: "1",
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    fontSize: "0.875rem",
    minWidth: 0,
  },
  pushHint: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
  },
  pushChevron: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  list: {
    overflow: "hidden",
  },
  toolbar: {
    gap: "0.75rem",
    paddingBlock: "0.75rem",
    paddingInline: { default: "0.875rem", [breakpoints.sm]: "1.125rem" },
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    minHeight: "3.75rem",
  },
  toolbarStart: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexGrow: 1,
    minWidth: 0,
  },
  filters: {
    gap: "0.375rem",
    display: "flex",
  },
  filter: {
    borderColor: colors.border,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    paddingInline: "0.875rem",
    textDecoration: "none",
    alignItems: "center",
    backgroundColor: { default: "transparent", ":hover": colors.accent },
    color: colors.mutedForeground,
    display: "inline-flex",
    fontSize: "0.8125rem",
    fontWeight: 600,
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    height: { default: "2.25rem", [breakpoints.sm]: "2rem" },
  },
  filterActive: {
    borderColor: `color-mix(in srgb, ${colors.primary} 55%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${colors.primary} 13%, transparent)`,
    color: ACCENT,
  },
  selection: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    minWidth: 0,
  },
  selectionCount: {
    color: colors.foreground,
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    whiteSpace: "nowrap",
    marginRight: "0.25rem",
  },
  selectionLabel: {
    display: { default: "none", [breakpoints.md]: "inline" },
  },
  search: {
    borderRadius: radius.full,
    flexBasis: { default: "100%", [breakpoints.sm]: "17rem" },
    flexGrow: { default: 1, [breakpoints.sm]: 0 },
    flexShrink: 1,
    minWidth: 0,
  },
  dayHeader: {
    gap: "0.5rem",
    paddingBlock: "0.5rem",
    paddingInline: { default: "0.875rem", [breakpoints.sm]: "1.125rem" },
    alignItems: "baseline",
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 3%, transparent)`,
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.6875rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
  dayCount: {
    fontFamily: font.mono,
    fontWeight: 500,
    letterSpacing: 0,
    opacity: 0.8,
  },
  rows: {
    display: "flex",
    flexDirection: "column",
    transitionDuration: "150ms",
    transitionProperty: "opacity",
    marginBottom: "-1px",
  },
  stale: {
    opacity: 0.6,
  },
})

type Search = NotificationsSearch

export function NotificationsPage() {
  const { session } = routeApi.useRouteContext()
  const search = routeApi.useSearch()
  const counts = useQuery(notificationCountsQueryOptions()).data
  const markAllRead = useMarkAllNotificationsRead()

  return (
    <AppShell user={session.user}>
      <div sx={styles.page}>
        <div sx={styles.layout}>
          <header sx={styles.header}>
            <div sx={styles.heading}>
              <h1 sx={styles.title}>{m.notifications_inbox()}</h1>
              <p sx={styles.summary}>
                {counts === undefined
                  ? " "
                  : m.notifications_summary({ unread: counts.unread, total: counts.total })}
              </p>
            </div>
            <div sx={styles.headerActions}>
              <Button
                disabled={(counts?.unread ?? 0) === 0}
                onClick={() => {
                  markAllRead.mutate(undefined)
                }}
                variant="outline"
              >
                <CheckAll />
                {m.notifications_mark_all_read()}
              </Button>
              <Button
                aria-label={m.notifications_settings_label()}
                render={<Link search={{ tab: "notifications" }} to="/settings" />}
                size="icon"
                sx={styles.settingsButton}
                variant="outline"
              >
                <Settings />
              </Button>
            </div>
          </header>
          <aside sx={styles.sidebar}>
            <CategoryNav counts={counts} search={search} />
            <Preferences user={session.user} />
          </aside>
          <main sx={styles.main}>
            <NotificationList search={search} viewerId={session.user.id} />
          </main>
        </div>
      </div>
    </AppShell>
  )
}

function CategoryNav({
  counts,
  search,
}: {
  counts: NotificationCounts | undefined
  search: Search
}) {
  return (
    <nav aria-label={m.notifications_categories()} sx={styles.nav}>
      {NAV_ITEMS.map(({ category, label, icon: Icon }) => {
        const active = search.category === category
        const count = category === undefined ? counts?.unread : counts?.categories[category]

        return (
          <Link
            aria-current={active ? "page" : undefined}
            key={category ?? "all"}
            search={{ category, unread: search.unread, q: search.q }}
            to="/notifications"
            {...stylex.props(styles.navItem, active && styles.navItemActive)}
          >
            <Icon size={17} sx={[styles.navIcon, active && styles.navIconActive]} />
            <span sx={styles.navLabel}>{label()}</span>
            {count === undefined || count === 0 ? null : (
              <span sx={styles.count}>{count > 99 ? "99+" : count}</span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

function Preferences({ user }: { user: Session["user"] }) {
  const settings = useBooleanSettings(user.settings)

  return (
    <section aria-labelledby="notify-me-about" sx={[styles.card, styles.preferences]}>
      <h2 id="notify-me-about" sx={styles.preferencesTitle}>
        {m.notifications_preferences_title()}
      </h2>
      <p sx={styles.preferencesDescription}>{m.notifications_preferences_description()}</p>
      <div sx={styles.preferenceList}>
        {NOTIFY_SETTINGS.map(({ key, icon: Icon, label }) => (
          <label key={key} sx={styles.preference}>
            <Icon size={17} sx={styles.preferenceIcon} />
            <span sx={styles.preferenceLabel}>{label()}</span>
            <Switch
              checked={settings.get(key)}
              onCheckedChange={(checked) => {
                settings.set(key, checked)
              }}
            />
          </label>
        ))}
      </div>
      <Link search={{ tab: "notifications" }} to="/settings" {...stylex.props(styles.pushLink)}>
        <span sx={styles.pushText}>
          {m.notifications_preference_push()}
          <span sx={styles.pushHint}>{m.notifications_preference_push_hint()}</span>
        </span>
        <ChevronRight size={16} sx={styles.pushChevron} />
      </Link>
    </section>
  )
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const dayLabel = (day: number, today: number, yesterday: number) => {
  if (day === today) {
    return m.notifications_day_today()
  }

  if (day === yesterday) {
    return m.notifications_day_yesterday()
  }

  const date = new Date(day)

  return new Intl.DateTimeFormat(getLocale(), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: date.getFullYear() === new Date(today).getFullYear() ? undefined : "numeric",
  }).format(date)
}
/** Splits notifications by local day, newest first, once the client knows its time zone. */
const groupByDay = (notifications: Notification[], today: number | null) => {
  if (today === null) {
    return [{ key: "all", label: null, items: notifications }]
  }

  const days = new Map<number, Notification[]>()

  for (const notification of notifications) {
    const day = startOfDay(new Date(notification.lastEventAt)).getTime()

    days.set(day, [...(days.get(day) ?? []), notification])
  }

  const yesterday = new Date(today)

  yesterday.setDate(yesterday.getDate() - 1)

  return [...days].map(([day, items]) => ({
    key: String(day),
    label: dayLabel(day, today, yesterday.getTime()),
    items,
  }))
}

function NotificationList({ search, viewerId }: { search: Search; viewerId: string }) {
  const navigate = routeApi.useNavigate()
  const page = search.page ?? 1
  const unread = search.unread ?? false
  const q = search.q ?? ""
  const query = useQuery(
    notificationsQueryOptions({
      page,
      perPage: NOTIFICATIONS_PER_PAGE,
      category: search.category,
      unread,
      q,
    }),
  )
  const today = useClientValue(() => startOfDay(new Date()).getTime())
  const view = `${search.category ?? ""}|${String(unread)}|${q}|${page}`
  // The selection belongs to what the list shows: changing the filters or the page drops it.
  const [selection, setSelection] = useState<{ view: string; ids: ReadonlySet<string> }>({
    view,
    ids: new Set(),
  })
  const selected = selection.view === view ? selection.ids : new Set<string>()
  const setSelected = (update: (current: ReadonlySet<string>) => ReadonlySet<string>) => {
    setSelection({ view, ids: update(selected) })
  }
  const [followersOpen, setFollowersOpen] = useState(false)
  const items = query.data?.data ?? []
  const visible = items.filter((notification) => selected.has(notification.id))
  const pageCount = Math.ceil((query.data?.meta.total ?? 0) / NOTIFICATIONS_PER_PAGE)

  if (query.data !== undefined && !query.isPlaceholderData && page > Math.max(pageCount, 1)) {
    return (
      <Navigate
        replace
        search={{ ...search, page: pageCount > 1 ? pageCount : undefined }}
        to="/notifications"
      />
    )
  }

  return (
    <>
      <section sx={[styles.card, styles.list]}>
        <Toolbar
          items={items}
          onClear={() => {
            setSelected(() => new Set())
          }}
          onSelectAll={(all) => {
            setSelected(() => new Set(all ? items.map(({ id }) => id) : []))
          }}
          search={search}
          selected={visible}
        />
        <ListBody
          groups={query.data === undefined ? undefined : groupByDay(items, today)}
          onSelectedChange={(id, checked) => {
            setSelected((current) => {
              const next = new Set(current)

              if (checked) {
                next.add(id)
              } else {
                next.delete(id)
              }

              return next
            })
          }}
          onShowFollowers={() => {
            setFollowersOpen(true)
          }}
          search={search}
          selected={selected}
          stale={query.isPlaceholderData}
          viewerId={viewerId}
        />
      </section>
      <PagePagination
        onJump={(target) => {
          void navigate({ search: { ...search, page: target === 1 ? undefined : target } })
        }}
        page={page}
        pageCount={pageCount}
        renderLink={(target) => (
          <Link
            search={{ ...search, page: target === 1 ? undefined : target }}
            to="/notifications"
          />
        )}
      />
      <FollowListDialog
        direction={followersOpen ? "followers" : null}
        hiddenFor={null}
        onClose={() => {
          setFollowersOpen(false)
        }}
        userId={viewerId}
      />
    </>
  )
}

function Toolbar({
  items,
  selected,
  search,
  onSelectAll,
  onClear,
}: {
  items: Notification[]
  selected: Notification[]
  search: Search
  onSelectAll: (all: boolean) => void
  onClear: () => void
}) {
  const setRead = useSetNotificationsRead()
  const remove = useDeleteNotifications()
  const ids = selected.map(({ id }) => id)
  const all = items.length > 0 && selected.length === items.length
  const onError = (error: unknown) => {
    toastManager.add({ title: getErrorMessage(error), type: "error" })
  }

  return (
    <div sx={styles.toolbar}>
      <div sx={styles.toolbarStart}>
        <Checkbox
          aria-label={m.notifications_select_page()}
          checked={all}
          disabled={items.length === 0}
          indeterminate={selected.length > 0 && !all}
          onCheckedChange={(checked) => {
            onSelectAll(checked)
          }}
        />
        {selected.length === 0 ? (
          <div aria-label={m.notifications_filter()} role="group" sx={styles.filters}>
            {[
              { unread: undefined, label: m.notifications_filter_all() },
              { unread: true, label: m.notifications_filter_unread() },
            ].map((filter) => {
              const active = (search.unread ?? false) === (filter.unread ?? false)

              return (
                <Link
                  aria-current={active ? "true" : undefined}
                  key={filter.label}
                  search={{ category: search.category, q: search.q, unread: filter.unread }}
                  to="/notifications"
                  {...stylex.props(styles.filter, active && styles.filterActive)}
                >
                  {filter.label}
                </Link>
              )
            })}
          </div>
        ) : (
          <div sx={styles.selection}>
            <span sx={styles.selectionCount}>
              {m.notifications_selected({ count: selected.length })}
            </span>
            <Button
              aria-label={m.notifications_mark_read()}
              disabled={selected.every((notification) => notification.readAt !== null)}
              onClick={() => {
                setRead.mutate({ ids, read: true }, { onError })
              }}
              variant="outline"
            >
              <Check />
              <span sx={styles.selectionLabel}>{m.notifications_mark_read()}</span>
            </Button>
            <Button
              aria-label={m.notifications_mark_unread()}
              disabled={selected.every((notification) => notification.readAt === null)}
              onClick={() => {
                setRead.mutate({ ids, read: false }, { onError })
              }}
              variant="outline"
            >
              <Mail />
              <span sx={styles.selectionLabel}>{m.notifications_mark_unread()}</span>
            </Button>
            <Button
              aria-label={m.notifications_delete()}
              onClick={() => {
                remove.mutate(ids, {
                  onError,
                  onSuccess: () => {
                    toastManager.add({
                      title:
                        ids.length === 1
                          ? m.notifications_deleted_one()
                          : m.notifications_deleted_many({ count: ids.length }),
                      type: "success",
                    })
                    onClear()
                  },
                })
              }}
              variant="destructive-outline"
            >
              <Trash />
              <span sx={styles.selectionLabel}>{m.notifications_delete()}</span>
            </Button>
          </div>
        )}
      </div>
      <SearchField search={search} />
    </div>
  )
}

function SearchField({ search }: { search: Search }) {
  const navigate = routeApi.useNavigate()
  const [value, setValue] = useState(search.q ?? "")

  useEffect(() => {
    const q = value.trim()
    const timer =
      q === (search.q ?? "")
        ? undefined
        : setTimeout(() => {
            void navigate({
              replace: true,
              resetScroll: false,
              search: { ...search, page: undefined, q: q === "" ? undefined : q },
            })
          }, SEARCH_DELAY_MS)

    return () => {
      clearTimeout(timer)
    }
  }, [navigate, search, value])

  return (
    <InputGroup sx={styles.search}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        aria-label={m.notifications_search()}
        maxLength={100}
        size="sm"
        onChange={(event) => {
          setValue(event.target.value)
        }}
        enterKeyHint="search"
        placeholder={m.notifications_search()}
        type="text"
        value={value}
      />
      {value === "" ? null : (
        <InputGroupAddon align="inline-end">
          <Button
            aria-label={m.notifications_clear_search()}
            onClick={() => {
              setValue("")
            }}
            size="icon-xs"
            variant="ghost"
          >
            <Close />
          </Button>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}

function ListBody({
  groups,
  search,
  selected,
  stale,
  viewerId,
  onSelectedChange,
  onShowFollowers,
}: {
  groups: ReturnType<typeof groupByDay> | undefined
  search: Search
  selected: ReadonlySet<string>
  stale: boolean
  viewerId: string
  onSelectedChange: (id: string, checked: boolean) => void
  onShowFollowers: () => void
}) {
  if (groups === undefined) {
    return (
      <div sx={styles.rows}>
        {range(0, 6).map((index) => (
          <NotificationRowSkeleton key={index} variant="page" />
        ))}
      </div>
    )
  }

  if (groups.every((group) => group.items.length === 0)) {
    return (
      <NotificationEmpty
        category={search.category}
        query={search.q ?? ""}
        unread={search.unread ?? false}
      />
    )
  }

  return groups.map((group) => (
    <div aria-label={group.label ?? undefined} key={group.key} role="group">
      {group.label === null ? null : (
        <div sx={styles.dayHeader}>
          {group.label}
          <span sx={styles.dayCount}>{group.items.length}</span>
        </div>
      )}
      <div sx={[styles.rows, stale && styles.stale]}>
        {group.items.map((notification) => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            onSelectedChange={(checked) => {
              onSelectedChange(notification.id, checked)
            }}
            onShowFollowers={onShowFollowers}
            selected={selected.has(notification.id)}
            variant="page"
            viewerId={viewerId}
          />
        ))}
      </div>
    </div>
  ))
}
