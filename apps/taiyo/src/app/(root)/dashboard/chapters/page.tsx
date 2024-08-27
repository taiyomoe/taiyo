import { DEFAULT_CHAPTERS_LIST_PER_PAGE } from "@taiyomoe/constants"
import {
  type GetChaptersListInput,
  getChaptersListSchema,
} from "@taiyomoe/schemas"
import { parseAsBoolean } from "nuqs/server"
import { ChaptersTableNew } from "~/components/ui/chapters/list/chapters-table"
import { api } from "~/trpc/server"
import {
  contentRatingsParser,
  flagsParser,
  intsParser,
  languagesParser,
  megaParser,
  pageParser,
  perPageParser,
  uuidsParser,
} from "~/utils/nuqsParsers"

type Props = {
  searchParams: Partial<Record<keyof GetChaptersListInput, string>>
}

export default async function Page({ searchParams }: Props) {
  const params = megaParser(searchParams, getChaptersListSchema, [
    ["numbers", intsParser, true],
    ["volumes", intsParser, true],
    ["languages", languagesParser, true],
    ["contentRatings", contentRatingsParser, true],
    ["flags", flagsParser, true],
    ["uploaderIds", uuidsParser, true],
    ["mediaIds", uuidsParser, true],
    ["scanIds", uuidsParser, true],
    ["deleterIds", uuidsParser, true],
    ["includeDeleted", parseAsBoolean.withDefault(false)],
    ["page", pageParser],
    ["perPage", perPageParser(DEFAULT_CHAPTERS_LIST_PER_PAGE)],
  ])
  const initialData = await api.chapters.getList(params)

  return (
    <div className="flex flex-col gap-12">
      <p className="font-semibold text-4xl">Capítulos</p>
      <ChaptersTableNew initialData={initialData} />
    </div>
  )
}
