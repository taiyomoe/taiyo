import { client } from "../"

const up = async () => {
  await client.command({ query: "CREATE DATABASE IF NOT EXISTS logs;" })

  await client.command({
    query: `
      CREATE TABLE IF NOT EXISTS logs._clickhouse_migrations (
        id UUID DEFAULT generateUUIDv4(),
        startedAt DateTime64,
        finishedAt Nullable(DateTime64),
        migrationName String,
        PRIMARY KEY (id)
      ) ENGINE = MergeTree() ORDER BY (id);
    `,
  })
}

export default {
  name: "20240722143359_init",
  up,
}
