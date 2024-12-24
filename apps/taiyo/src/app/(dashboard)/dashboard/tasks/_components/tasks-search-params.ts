import { TaskStatus, TaskType } from "@prisma/client"
import { DEFAULT_TASKS_LIST_PER_PAGE } from "@taiyomoe/constants"
import { createSearchParamsCache, parseAsInteger } from "nuqs/server"
import {
  dateFilterParser,
  enumFilterParser,
} from "~/utils/search-params-parsers"

export const tasksSearchParams = {
  ...enumFilterParser("status", TaskStatus),
  ...enumFilterParser("type", TaskType),
  ...dateFilterParser("createdAt"),
  ...dateFilterParser("updatedAt"),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(DEFAULT_TASKS_LIST_PER_PAGE),
}

export const tasksSearchParamsCache = createSearchParamsCache(tasksSearchParams)
