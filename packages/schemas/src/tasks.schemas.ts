import {
  DEFAULT_TASKS_LIST_PER_PAGE,
  TASKS_LIST_PER_PAGE_CHOICES,
  TASKS_LIST_SORTABLE_FIELDS,
} from "@taiyomoe/constants"
import { z } from "zod"
import { pageSchema, perPageSchema } from "./common.schemas"

export const getTasksListSchema = z.object({
  filter: z.string().catch(""),
  sort: z
    .tuple([z.enum(TASKS_LIST_SORTABLE_FIELDS), z.enum(["asc", "desc"])])
    .array()
    .catch([]),
  page: pageSchema,
  perPage: perPageSchema(
    DEFAULT_TASKS_LIST_PER_PAGE,
    TASKS_LIST_PER_PAGE_CHOICES,
  ),
})

export type GetTasksListInput = z.infer<typeof getTasksListSchema>
