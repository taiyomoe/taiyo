import type { Task, TaskType } from "@prisma/client"
import type {
  ImportChapterMessageInput,
  ImportCoverMessageInput,
} from "@taiyomoe/types"

const getPayload = <TType extends TaskType>(input: Task, _type: TType) =>
  input.payload as TType extends "IMPORT_COVER"
    ? ImportCoverMessageInput
    : ImportChapterMessageInput

export const TaskUtils = {
  getPayload,
}
