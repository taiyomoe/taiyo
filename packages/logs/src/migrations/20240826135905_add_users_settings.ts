import { rawLogsClient } from ".."

const up = async () => {
  await rawLogsClient.command({
    query: `
      CREATE TABLE IF NOT EXISTS logs.usersSettings (
        id UUID DEFAULT generateUUIDv4(),
        createdAt DateTime64 DEFAULT now(),
        type Enum8('profile.birthDate' = 1, 'profile.gender' = 2, 'profile.city' = 3, 'profile.country' = 4, 'profile.about' = 5, 'contentRating' = 6, 'preferredTitles' = 7, 'showFollowing' = 8, 'showLibrary' = 9),
        old String,
        new String,
        userId UUID,
        PRIMARY KEY (id)
      ) ENGINE = MergeTree() ORDER BY (id);
    `,
  })
}

export default {
  name: "20240826135905_add_users_settings",
  up,
}
