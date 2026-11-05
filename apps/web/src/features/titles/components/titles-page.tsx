import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, font, radius, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { range } from "remeda"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/titles")
const styles = stylex.create({
  page: {
    padding: "2rem",
    gap: "1rem",
    marginInline: "auto",
    display: "flex",
    flexDirection: "column",
    maxWidth: "48rem",
  },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontFamily: font.heading,
    fontSize: text.xl,
    fontWeight: font.weightBold,
  },
  count: {
    margin: 0,
    color: colors.mutedForeground,
  },
  list: {
    margin: 0,
    padding: 0,
    gap: "0.5rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  item: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
    color: colors.cardForeground,
  },
  countSkeleton: {
    height: "1.5rem",
    width: "6rem",
  },
  itemSkeleton: {
    borderRadius: radius.lg,
    height: "3.125rem",
  },
})

export function TitlesPage() {
  return (
    <div sx={styles.page}>
      <h1 sx={styles.heading}>{m.titles_heading()}</h1>
      <Suspense
        fallback={
          <>
            <Skeleton sx={styles.countSkeleton} />
            <ul aria-hidden sx={styles.list}>
              {range(0, 12).map((index) => (
                <Skeleton key={index} sx={styles.itemSkeleton} />
              ))}
            </ul>
          </>
        }
      >
        <TitlesContent />
      </Suspense>
    </div>
  )
}

function TitlesContent() {
  const { titlesQueryOptions } = routeApi.useRouteContext()
  const { data } = useSuspenseQuery(titlesQueryOptions)

  return (
    <>
      <p sx={styles.count}>{m.titles_count({ count: data.meta.total })}</p>
      {data.data.length === 0 ? (
        <p sx={styles.count}>{m.titles_empty()}</p>
      ) : (
        <ul sx={styles.list}>
          {data.data.map((hit) => (
            <li key={hit.id} sx={styles.item}>
              {hit.mainTitle?.title ?? hit.id}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
