import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { scans } from "../../schema/scans";

const execute = async (db: PostgresJsDatabase) => {
  await db.insert(scans).values({
    id: "2301e266-2162-4480-93bb-da510feafbbf",
    // -----
    name: "I Wish Scan",
    description: "É agora ou nunca.",
    // -----,
    banner: "https://i.imgur.com/rdrUVCh.png",
    // -----,
    website: "http://iwishscan.blogspot.com/",
  });
};

export default { execute };
