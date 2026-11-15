import { CONTENT_RATINGS } from "@taiyomoe/db/constants"
import { m } from "@/paraglide/messages"

export const ALL_CONTENT_RATINGS = [...CONTENT_RATINGS]

export const formatTitleCount = (count: number) =>
  count === 1 ? m.lists_titles_count_one() : m.lists_titles_count({ count })
