import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server"

export const tasksSearchParamsCache = createSearchParamsCache({
  filter: parseAsString,
  page: parseAsInteger,
  perPage: parseAsInteger,
})
