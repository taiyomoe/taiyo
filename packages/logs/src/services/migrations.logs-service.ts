import type { LogsMigration } from "../"
import { rawLogsClient } from "../raw-client"

export const MigrationsService = {
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
  clear: () =>
    rawLogsClient.command({ query: "DROP DATABASE IF EXISTS logs;" }),
}
