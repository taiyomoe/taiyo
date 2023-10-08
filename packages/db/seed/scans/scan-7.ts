import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { scanMembers } from "../../schema/scanMembers";
import { scans } from "../../schema/scans";

const execute = async (db: PostgresJsDatabase) => {
  await db.insert(scans).values({
    id: "580de6a0-e1e5-4e5f-b36c-5bd1e55adf20",
    // -----
    name: "Shin Sekai Scans",
    description: "É agora ou nunca.",
    // -----,
    logo: "",
    banner: "",
    // -----,
    website: "https://shinsekaiscans.wordpress.com/",
    twitter: "https://twitter.com/ShinSekaiscans",
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
