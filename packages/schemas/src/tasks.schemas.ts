import {
  DEFAULT_TASKS_LIST_PER_PAGE,
  TASKS_LIST_PER_PAGE_CHOICES,
  TASKS_LIST_SORTABLE_FIELDS,
} from "@taiyomoe/constants"
import { z } from "zod"
import {
  dateFilterSchema,
  enumFilterSchema,
  pageSchema,
  perPageSchema,
} from "./common.schemas"
import { TaskStatusSchema, TaskTypeSchema } from "./prisma"

export const getTasksListSchema = z.object({
  status: enumFilterSchema(TaskStatusSchema),
  type: enumFilterSchema(TaskTypeSchema),
  createdAt: dateFilterSchema,
  updatedAt: dateFilterSchema,
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
