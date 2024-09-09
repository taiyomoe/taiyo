import { rawLogsClient } from "../"

const up = async () => {
  await rawLogsClient.command({
    query: `
      CREATE TABLE IF NOT EXISTS logs.usersActivity (
        id UUID DEFAULT generateUUIDv4(),
        createdAt DateTime64 DEFAULT now(),
        type Enum8('follow' = 1, 'unfollow' = 2, 'completedChapter' = 3),
        userId UUID,
        targetId UUID,
        PRIMARY KEY (id)
      ) ENGINE = MergeTree() ORDER BY (id);
    `,
  })
}

export default {
  name: "20240824232511_add_users_activity",
  up,
}
