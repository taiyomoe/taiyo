import type { MediaChapter } from "@taiyomoe/db"

export type LogsUsersAuthType = "registered" | "signedIn" | "signedOut"

export type LogsMigration = {
  id: string
  startedAt: Date
  finishedAt: Date | null
  migrationName: string
}

export type LogsChapter = LogsResource<
  { id: string; createdAt: Date; chapterId: string; userId: string },
  MediaChapter
>

type LogsResource<TRaw, TModel> = TRaw & { diff: (keyof TModel)[] } & (
    | {
        type: "created"
        old: null
        new: TModel
      }
    | {
        type: "updated"
        old: TModel
        new: TModel
      }
    | {
        type: "deleted"
        old: TModel
        new: null
      }
  )

export type InsertResource<TModel> = { userId: string } & (
  | { type: "created"; _new: TModel }
  | { type: "deleted"; old: TModel }
  | { type: "updated"; old: TModel; _new: TModel }
)
