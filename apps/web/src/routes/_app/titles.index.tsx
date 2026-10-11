import * as stylex from "@stylexjs/stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, getRouteApi } from "@tanstack/react-router"
import { Search } from "@taiyomoe/ui/components/icons"
import { colors, font, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { z } from "zod"

import { EmptyState } from "@/components/app/empty-state"
import { PagePagination } from "@/components/app/page-pagination"
import { CoverGrid, CoverGridItem, CoverGridSkeleton } from "@/components/media/cover-grid"
import { MediaCard } from "@/components/media/media-card"
import { searchMediasQueryOptions } from "@/lib/queries/medias"
import { m } from "@/paraglide/messages"

const PER_PAGE = 24
const FIRST_PAGE = 1
const searchSchema = z.object({
  page: z.coerce.number().int().min(FIRST_PAGE).optional(),
  q: z.string().trim().min(1).optional().catch(undefined),
})

export const Route = createFileRoute("/_app/titles/")({
  head: () => ({
    meta: [
      { title: m.titles_meta_title() },
      { name: "description", content: m.titles_meta_description() },
    ],
  }),
  validateSearch: searchSchema,
  loaderDeps: ({ search: { page, q } }) => ({ page, q }),
  context: ({ deps: { page, q } }) => ({
    titlesQueryOptions: searchMediasQueryOptions({
      page: page ?? FIRST_PAGE,
      perPage: PER_PAGE,
      ...(q ? { q } : {}),
    }),
  }),
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(context.titlesQueryOptions)
  },
  pendingComponent: TitlesPending,
  component: Titles,
})

const routeApi = getRouteApi("/_app/titles/")
const styles = stylex.create({
  header: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
    marginBottom: "2rem",
  },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontFamily: font.heading,
    fontSize: text.xxxl,
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  count: {
    margin: 0,
    color: colors.mutedForeground,
  },
})

function TitlesHeader({ q, total }: { q?: string; total?: number }) {
  return (
    <header sx={styles.header}>
      <h1 sx={styles.heading}>{q ? m.titles_search_heading({ query: q }) : m.titles_heading()}</h1>
      {total === undefined ? null : <p sx={styles.count}>{m.titles_count({ count: total })}</p>}
    </header>
  )
}

function TitlesPending() {
  const { q } = routeApi.useSearch()

  return (
    <>
      <TitlesHeader q={q} />
      <CoverGridSkeleton count={PER_PAGE} />
    </>
  )
}

function Titles() {
  const { q } = routeApi.useSearch()
  const { titlesQueryOptions } = routeApi.useRouteContext()
  const { data } = useSuspenseQuery(titlesQueryOptions)

  return (
    <>
      <TitlesHeader q={q} total={data.meta.total} />
      {data.data.length === 0 ? (
        <EmptyState
          description={m.titles_empty_description()}
          icon={<Search />}
          title={m.titles_empty()}
        />
      ) : (
        <CoverGrid>
          {data.data.map((hit) => (
            <CoverGridItem key={hit.id}>
              <MediaCard hit={hit} />
            </CoverGridItem>
          ))}
        </CoverGrid>
      )}
      <PagePagination page={data.meta.page} perPage={data.meta.perPage} total={data.meta.total} />
    </>
  )
}
