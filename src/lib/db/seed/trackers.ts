import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { trackers } from "~/lib/db/schema/trackers";

const execute = async (db: PostgresJsDatabase) => {
  await db.insert(trackers).values([
    {
      id: "6c61f739-1ca3-467b-9d08-b7a2e58efb21",
      name: "MangaDex",
      logo: "https://mangadex.org/img/brand/mangadex-logo.svg",
      creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
    },
    {
      id: "a4ffe426-9496-4167-ade3-b3789f81fb75",
      name: "AniList",
      logo: "https://anilist.co/img/icons/icon.svg",
      creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
    },
    {
      id: "a92f9633-074a-4385-8bcb-077e94c2441e",
      name: "MyAnimeList",
      logo: "https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png",
      creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
    },
  ]);
};

export default { execute };
