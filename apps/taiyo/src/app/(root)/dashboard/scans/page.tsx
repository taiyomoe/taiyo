import {
  DEFAULT_SCANS_LIST_PER_PAGE,
  SCANS_LIST_PER_PAGE_CHOICES,
} from "@taiyomoe/constants"
import { pageSchema, perPageSchema } from "@taiyomoe/schemas"
import { ScansTable } from "~/components/ui/scans/scans-table"
import { api } from "~/trpc/server"

type Props = {
  searchParams: {
    q?: string
    page?: string
    perPage?: string
  }
}

export default async function Page({ searchParams }: Props) {
  const page = pageSchema.parse(searchParams.page)
  const perPage = perPageSchema(
    DEFAULT_SCANS_LIST_PER_PAGE,
    SCANS_LIST_PER_PAGE_CHOICES,
  ).parse(searchParams.perPage)
  const initialData = await api.scans.getList({
    query: searchParams.q,
    page,
    perPage,
  })

  return <ScansTable initialData={initialData} />
}
