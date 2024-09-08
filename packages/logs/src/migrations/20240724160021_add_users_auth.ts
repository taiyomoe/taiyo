import { rawLogsClient } from "../"

const up = async () => {
  await rawLogsClient.command({
    query: `
      CREATE TABLE IF NOT EXISTS logs.usersAuth (
        id UUID DEFAULT generateUUIDv4(),
        createdAt DateTime64 DEFAULT now(),
        type Enum8('registered' = 1, 'signedIn' = 2, 'signedOut' = 3),
        ip String,
        userId UUID,
        PRIMARY KEY (id)
      ) ENGINE = MergeTree() ORDER BY (id);
    `,
  })
}

export default {
  name: "20240724160021_add_users_auth",
  up,
}
