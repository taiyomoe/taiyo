import {
  DEFAULT_TASKS_LIST_PER_PAGE,
  TASKS_LIST_PER_PAGE_CHOICES,
  TASKS_LIST_SORTABLE_FIELDS,
} from "@taiyomoe/constants"
import { z } from "zod"
import {
  pageSchema,
  perPageSchema,
  sortableFieldsSchema,
} from "./common.schemas"

export const getTasksListSchema = z.object({
  filter: z.string().optional().default(""),
  sort: sortableFieldsSchema(TASKS_LIST_SORTABLE_FIELDS),
  page: pageSchema,
  perPage: perPageSchema(
    DEFAULT_TASKS_LIST_PER_PAGE,
    TASKS_LIST_PER_PAGE_CHOICES,
  ),
})
