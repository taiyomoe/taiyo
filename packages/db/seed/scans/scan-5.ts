import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { scanMembers } from "../../schema/scanMembers";
import { scans } from "../../schema/scans";

const execute = async (db: PostgresJsDatabase) => {
  await db.insert(scans).values({
    id: "6c6a8a30-701c-44de-bcab-3e567587870f",
    // -----
    name: "Kyodai Mangás",
    // -----,
    discord: "https://discord.gg/9Mk8uz6aRK",
    // -----
    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
  });

  await db.insert(scanMembers).values([
    {
      id: "83a47a78-50cb-4b52-bf12-2365e8aa2fe3",
      // -----
      roles: ["OWNER", "QUALITY_CHECKER", "TYPESETTER"],
      permissions: ["UPLOAD", "EDIT", "DELETE"],
      // -----
      userId: "81825dd9-01c5-4a8a-9882-f63fd53cc163",
    },
    {
      id: "395a1f4b-4260-4a1a-ad46-48e6f649cefa",
      // -----
      roles: ["TRANSLATOR"],
      permissions: ["UPLOAD", "EDIT"],
      // -----
      userId: "6c60a451-4a2d-4179-9b76-7be17d661f53",
    },
  ]);
};

export default { execute };
