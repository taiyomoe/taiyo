import * as stylex from "@stylexjs/stylex"
import { colors, font, radius, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
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
})

export function TitlesPage() {
  const { titlesQueryOptions } = routeApi.useRouteContext()
  const { data } = useSuspenseQuery(titlesQueryOptions)

  return (
    <div sx={styles.page}>
      <h1 sx={styles.heading}>{m.titles_heading()}</h1>
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
    </div>
  )
}
