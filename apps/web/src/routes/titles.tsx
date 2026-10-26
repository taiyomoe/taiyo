import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { searchMediasQueryOptions } from "@/features/media/api/medias"
import { TitlesPage } from "@/features/titles/components/titles-page"
import { m } from "@/paraglide/messages"

const PER_PAGE = 20
const FIRST_PAGE = 1
const searchSchema = z.object({
  page: z.coerce.number().int().min(FIRST_PAGE).optional(),
})

export const Route = createFileRoute("/titles")({
  head: () => ({
    meta: [
      { title: m.titles_meta_title() },
      { name: "description", content: m.titles_meta_description() },
    ],
  }),
  validateSearch: searchSchema,
  loaderDeps: ({ search: { page } }) => ({ page }),
  context: ({ deps: { page } }) => ({
    titlesQueryOptions: searchMediasQueryOptions({ page: page ?? FIRST_PAGE, perPage: PER_PAGE }),
  }),
  loader: ({ context }) => {
    void context.queryClient.query(context.titlesQueryOptions).catch(noop)
  },
  component: TitlesPage,
})
