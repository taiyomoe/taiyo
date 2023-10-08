import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { scans } from "../../schema/scans";

const execute = async (db: PostgresJsDatabase) => {
  await db.insert(scans).values({
    id: "b00236e8-e73e-40d7-aa71-8893854d62a1",
    // -----
    name: "I Wish Scan",
    description: "É agora ou nunca.",
    // -----,
    logo: "",
    banner: "",
    // -----,
    website: "http://iwishscan.blogspot.com/",
  });
};

export default { execute };
