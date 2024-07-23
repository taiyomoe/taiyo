import { client } from "./"
import type { Migration } from "./types"

export const wrapper = {
  migrations: {
    getAll: () =>
      client
        .query({
          query: "SELECT * FROM logs._clickhouse_migrations;",
          format: "JSONEachRow",
        })
        .then((r) => r.json<Migration>())
        .catch(() => [] as Migration[]),
    insert: (name: string, startedAt: Date, finishedAt: Date) =>
      client.command({
        query:
          "INSERT INTO logs._clickhouse_migrations (startedAt, finishedAt, migrationName) VALUES ({startedAt: DateTime64}, {finishedAt: DateTime64}, {migrationName: String});",
        query_params: { startedAt, finishedAt, migrationName: name },
      }),
  },
}
