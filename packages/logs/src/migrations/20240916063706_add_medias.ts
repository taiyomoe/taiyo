import { rawLogsClient } from "../"

const up = async () => {
  await rawLogsClient.command({
    query:
      "ALTER TABLE logs.chapters MODIFY COLUMN type Enum8('created' = 1, 'updated' = 2, 'deleted' = 3, 'restored' = 4, 'imported' = 5, 'synced' = 6);",
  })

  await rawLogsClient.command({
    query: `
      CREATE TABLE IF NOT EXISTS logs.medias (
        id UUID DEFAULT generateUUIDv4(),
        createdAt DateTime64 DEFAULT now(),
        type Enum8('created' = 1, 'updated' = 2, 'deleted' = 3, 'restored' = 4, 'imported' = 5, 'synced' = 6),
        old JSON,
        new JSON,
        diff Array(String),
        userId UUID,
        PRIMARY KEY (id)
      ) ENGINE = MergeTree() ORDER BY (id);
    `,
  })

  await rawLogsClient.command({
    query: `
      CREATE TABLE IF NOT EXISTS logs.covers (
        id UUID DEFAULT generateUUIDv4(),
        createdAt DateTime64 DEFAULT now(),
        type Enum8('created' = 1, 'updated' = 2, 'deleted' = 3, 'restored' = 4, 'imported' = 5, 'synced' = 6),
        old JSON,
        new JSON,
        diff Array(String),
        coverId UUID,
        userId UUID,
        PRIMARY KEY (id)
      ) ENGINE = MergeTree() ORDER BY (id);
    `,
  })

  await rawLogsClient.command({
    query: `
      CREATE TABLE IF NOT EXISTS logs.titles (
        id UUID DEFAULT generateUUIDv4(),
        createdAt DateTime64 DEFAULT now(),
        type Enum8('created' = 1, 'updated' = 2, 'deleted' = 3, 'imported' = 5, 'synced' = 6),
        old JSON,
        new JSON,
        diff Array(String),
        chapterId UUID,
        userId UUID,
        PRIMARY KEY (id)
      ) ENGINE = MergeTree() ORDER BY (id);
    `,
  })

  await rawLogsClient.command({
    query: `
      CREATE TABLE IF NOT EXISTS logs.trackers (
        id UUID DEFAULT generateUUIDv4(),
        createdAt DateTime64 DEFAULT now(),
        type Enum8('created' = 1, 'updated' = 2, 'deleted' = 3, 'imported' = 5, 'synced' = 6),
        old JSON,
        new JSON,
        diff Array(String),
        trackerId UUID,
        userId UUID,
        PRIMARY KEY (id)
      ) ENGINE = MergeTree() ORDER BY (id);
    `,
  })
}

export default {
  name: "20240916063706_add_medias",
  up,
}
