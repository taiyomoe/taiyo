import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { scanMembers } from "../../schema/scanMembers";
import { scans } from "../../schema/scans";

const execute = async (db: PostgresJsDatabase) => {
  await db.insert(scans).values({
    id: "a9f2139e-54fc-4524-8688-ed7b46920f5d",
    // -----
    name: "Shin Sekai Scans",
    description: "É agora ou nunca.",
    // -----,
    website: "https://shinsekaiscans.wordpress.com/",
    twitter: "https://twitter.com/ShinSekaiscans",
    // -----
    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
  });

  await db.insert(scanMembers).values([
    {
      id: "d921ff40-e70a-4623-a2e5-17c7a3f9a7f5",
      // -----
      roles: ["TRANSLATOR", "TYPESETTER"],
      permissions: ["UPLOAD", "EDIT"],
      // -----
      userId: "e368b9b5-fc7e-4235-9f08-9902db00a691",
    },
    {
      id: "f9580aec-dcae-4ad7-8fe3-078124bf14fc",
      // -----
      roles: ["PROOFREADER"],
      permissions: ["UPLOAD", "EDIT"],
      // -----
      userId: "4ede745e-519d-4d09-b930-d91af930f12c",
    },
  ]);
};

export default { execute };
