import { DEFAULT_TASKS_LIST_PER_PAGE } from "@taiyomoe/constants"
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server"

export const tasksSearchParams = {
  filter: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(DEFAULT_TASKS_LIST_PER_PAGE),
}

export const tasksSearchParamsCache = createSearchParamsCache(tasksSearchParams)
