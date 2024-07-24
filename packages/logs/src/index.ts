import { createClient } from "@clickhouse/client-web"
import type { MediaChapter } from "@taiyomoe/db"
import { ObjectUtils } from "@taiyomoe/utils"
import SuperJSON from "superjson"
import { env } from "../env"
import type { LogsMigration, LogsType } from "./types"

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
    insert: async (
      type: LogsType,
      old: MediaChapter | null,
      _new: MediaChapter | null,
      userId: string,
    ) =>
      rawLogsClient.insert({
        table: "logs.chapters",
        values: [
          ["type", "old", "new", "diff", "chapterId", "userId"],
          [
            type,
            SuperJSON.serialize(old ?? {}),
            SuperJSON.serialize(_new ?? {}),
            old && _new ? Object.keys(ObjectUtils.deepDiff(old, _new)) : [],
            old?.id || _new?.id,
            userId,
          ],
        ],
        format: "JSONCompactEachRowWithNames",
      }),
  },
}

export * from "./types"
