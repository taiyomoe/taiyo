import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { noop, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, getRouteApi } from "@tanstack/react-router"
import { mediaQueryOptions } from "@/lib/queries/medias"

export const Route = createFileRoute("/media/$mediaId")({
  context: ({ params }) => ({ mediaQueryOptions: mediaQueryOptions(params.mediaId) }),
  loader: ({ context }) => {
    void context.queryClient.query(context.mediaQueryOptions).catch(noop)
  },
  component: MediaPage,
})

const routeApi = getRouteApi("/media/$mediaId")
const styles = stylex.create({
  json: {
    margin: 0,
    padding: "2rem",
    overflow: "auto",
    color: colors.foreground,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
})

function MediaPage() {
  const { mediaQueryOptions: options } = routeApi.useRouteContext()
  const { data } = useSuspenseQuery(options)

  return <pre sx={styles.json}>{JSON.stringify(data, null, 2)}</pre>
}
