import { client } from "../"

const up = async () => {
  await client.command({
    query: `
      CREATE TABLE IF NOT EXISTS logs.chapters (
        id UUID DEFAULT generateUUIDv4(),
        createdAt DateTime64 DEFAULT now(),
        type Enum8('created' = 1, 'updated' = 2, 'deleted' = 3),
        old JSON,
        new JSON,
        diff Array(String),
        PRIMARY KEY (id)
      ) ENGINE = MergeTree() ORDER BY (id);
    `,
    clickhouse_settings: {
      allow_experimental_object_type: 1,
    },
  })
}

export default {
  name: "20240723104911_add_chapters",
  up,
}
