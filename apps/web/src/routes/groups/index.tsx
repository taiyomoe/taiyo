import * as stylex from "@stylexjs/stylex"
import { Search, Users } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, font, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { noop, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { Suspense, useState } from "react"
import { range } from "remeda"
import { z } from "zod"
import { GroupAvatar } from "@/components/groups/group-avatar"
import { PagePagination } from "@/components/pagination/page-pagination"
import { sceneFont } from "@/components/scene/scene.stylex"
import { AppShell } from "@/components/shell/app-shell"
import { GROUPS_PER_PAGE, groupsQueryOptions } from "@/lib/queries/groups"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  page: {
    gap: "1.75rem",
    paddingBlock: "2rem",
    paddingInline: { default: "1.25rem", "@media (width >= 48rem)": "2rem" },
    display: "flex",
    flexDirection: "column",
  },
  header: {
    gap: "1.25rem",
    alignItems: "flex-end",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  intro: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: { default: "1.75rem", "@media (width >= 48rem)": "2.25rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: 0,
    color: colors.mutedForeground,
  },
  search: {
    width: { default: "100%", "@media (width >= 40rem)": "20rem" },
  },
  searchIcon: {
    color: colors.mutedForeground,
  },
  grid: {
    gap: "0.75rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))",
  },
  card: {
    padding: "0.875rem",
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.875rem",
    textDecoration: "none",
    alignItems: "center",
    backgroundColor: {
      default: colors.card,
      ":hover": `color-mix(in srgb, ${colors.foreground} 4%, ${colors.card})`,
    },
    color: "inherit",
    display: "flex",
    transitionDuration: motion.enter,
    transitionProperty: "background-color",
    minWidth: 0,
  },
  name: {
    overflow: "hidden",
    flexGrow: 1,
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  skeleton: {
    borderRadius: radius.xl,
    height: "4.25rem",
  },
  footer: {
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
    textAlign: "center",
  },
  footerLink: {
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    fontWeight: 500,
  },
})
const searchSchema = z.object({
  q: z.string().trim().min(1).max(100).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/groups/")({
  head: () => ({ meta: [{ title: m.groups_meta_title() }] }),
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ q: search.q, page: search.page ?? 1 }),
  loader: async ({ context, deps: { q, page } }) => {
    const prefetch = context.queryClient.query(groupsQueryOptions({ page, search: q })).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: function Groups() {
    const { session } = Route.useRouteContext()
    const { q: search, page } = Route.useLoaderDeps()
    const user = session?.user ?? null
    const navigate = useNavigate({ from: "/groups/" })
    const [draft, setDraft] = useState(search ?? "")

    return (
      <AppShell user={user}>
        <div sx={styles.page}>
          <div sx={styles.header}>
            <div sx={styles.intro}>
              <h1 sx={styles.heading}>{m.groups_title()}</h1>
              <p sx={styles.subtitle}>{m.groups_subtitle()}</p>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void navigate({ search: { q: draft.trim() === "" ? undefined : draft.trim() } })
              }}
              role="search"
              sx={styles.search}
            >
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Search {...stylex.props(styles.searchIcon)} />
                </InputGroupAddon>
                <InputGroupInput
                  aria-label={m.groups_search_placeholder()}
                  onChange={(event) => {
                    setDraft(event.target.value)
                  }}
                  placeholder={m.groups_search_placeholder()}
                  type="search"
                  value={draft}
                />
              </InputGroup>
            </form>
          </div>
          <Suspense
            fallback={
              <div sx={styles.grid}>
                {range(0, 12).map((index) => (
                  <Skeleton key={index} sx={styles.skeleton} />
                ))}
              </div>
            }
          >
            <GroupsGrid page={page} search={search} />
          </Suspense>
          <p sx={styles.footer}>
            {m.groups_request_cta()}{" "}
            <Link
              {...stylex.props(styles.footerLink)}
              to={user === null ? "/auth/sign-in" : "/dashboard/groups"}
            >
              {m.groups_request_link()}
            </Link>
          </p>
        </div>
      </AppShell>
    )
  },
})

function GroupsGrid({ search, page }: { search: string | undefined; page: number }) {
  const navigate = useNavigate({ from: "/groups/" })
  const { data } = useSuspenseQuery(groupsQueryOptions({ page, search }))
  const pageCount = Math.ceil(data.meta.total / GROUPS_PER_PAGE)

  if (data.data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>
          <EmptyTitle>{m.groups_empty_title()}</EmptyTitle>
          <EmptyDescription>{m.groups_empty_description()}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <>
      <div sx={styles.grid}>
        {data.data.map((group) => (
          <Link
            key={group.id}
            params={{ groupId: group.id }}
            {...stylex.props(styles.card)}
            to="/groups/$groupId"
          >
            <GroupAvatar id={group.id} name={group.name} />
            <span sx={styles.name}>{group.name}</span>
            {group.owned ? <Badge variant="success">{m.group_owned()}</Badge> : null}
          </Link>
        ))}
      </div>
      <PagePagination
        onJump={(target) => {
          void navigate({
            search: (prev) => ({ ...prev, page: target === 1 ? undefined : target }),
          })
        }}
        page={page}
        pageCount={pageCount}
        renderLink={(target) => (
          <Link
            search={(prev) => ({ ...prev, page: target === 1 ? undefined : target })}
            to="/groups"
          />
        )}
      />
    </>
  )
}
