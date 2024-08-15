import { createClient } from "@clickhouse/client-web"
import type { MediaChapter } from "@taiyomoe/db"
import { ObjectUtils } from "@taiyomoe/utils"
import SuperJSON from "superjson"
import { env } from "../env"
import type { InsertResource, LogsMigration, LogsUsersAuthType } from "./types"

export const rawLogsClient = createClient({
  url: env.CLICKHOUSE_URL,
  username: env.CLICKHOUSE_USERNAME,
  password: env.CLICKHOUSE_PASSWORD,
  clickhouse_settings: {
    allow_experimental_object_type: 1,
    date_time_input_format: "best_effort",
  },
})

export const logsClient = {
  migrations: {
    getAll: () =>
      rawLogsClient
        .query({
          query: "SELECT * FROM logs._clickhouse_migrations;",
          format: "JSONEachRow",
        })
        .then((r) => r.json<LogsMigration>())
        .catch(() => [] as LogsMigration[]),
    insert: (name: string, startedAt: Date, finishedAt: Date) =>
      rawLogsClient.command({
        query:
          "INSERT INTO logs._clickhouse_migrations (startedAt, finishedAt, migrationName) VALUES ({startedAt: DateTime64}, {finishedAt: DateTime64}, {migrationName: String});",
        query_params: { startedAt, finishedAt, migrationName: name },
      }),
  },

  chapters: {
    insert: (input: InsertResource<MediaChapter>) =>
      rawLogsClient.insert({
        table: "logs.chapters",
        values: [
          ["type", "old", "new", "diff", "chapterId", "userId"],
          [
            input.type,
            SuperJSON.serialize("old" in input ? input.old : {}),
            SuperJSON.serialize("_new" in input ? input._new : {}),
            input.type === "updated"
              ? Object.keys(ObjectUtils.deepDiff(input.old, input._new))
              : [],
            "old" in input ? input.old.id : input._new.id,
            input.userId,
          ],
        ],
        format: "JSONCompactEachRowWithNames",
      }),
  },

  users: {
    auth: {
      insert: (input: {
        type: LogsUsersAuthType
        ip: string
        userId: string
      }) =>
        rawLogsClient.insert({
          table: "logs.usersAuth",
          values: [
            ["type", "ip", "userId"],
            [input.type, input.ip, input.userId],
          ],
          format: "JSONCompactEachRowWithNames",
        }),
    },
  },
}

export * from "./types"
