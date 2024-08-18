import { rawLogsClient } from ".."

const up = async () => {
  await rawLogsClient.command({
    query: `
      CREATE TABLE IF NOT EXISTS logs.scans (
        id UUID DEFAULT generateUUIDv4(),
        createdAt DateTime64 DEFAULT now(),
        type Enum8('created' = 1, 'updated' = 2, 'deleted' = 3),
        old JSON,
        new JSON,
        diff Array(String),
        affectedChaptersId Array(UUID),
        scanId UUID,
        userId UUID,
        PRIMARY KEY (id)
      ) ENGINE = MergeTree() ORDER BY (id);
    `,
  })
}

export default {
  name: "20240818012246_add_scans",
  up,
}
