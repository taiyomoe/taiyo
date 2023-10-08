import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { scanMembers } from "../../schema/scanMembers";
import { scans } from "../../schema/scans";

const execute = async (db: PostgresJsDatabase) => {
  await db.insert(scans).values({
    id: "4b7a9591-2591-499a-a1cf-f27e62aabf0e",
    // -----
    name: "Saturn Scan",
    // -----,
    website: "http://saturnscans.blogspot.com/",
  });

  await db.insert(scanMembers).values([
    {
      id: "567b6021-2b59-45d0-b5a4-5f013805e6a2",
      // -----
      roles: ["OWNER", "TRANSLATOR", "TYPESETTER"],
      permissions: ["UPLOAD", "EDIT", "DELETE"],
      // -----
      userId: "6b8b87eb-382c-4fc1-9da6-a6e8b21f6be8",
    },
    {
      id: "2ec4f418-e49a-4b24-8a2e-998aebb6b809",
      // -----
      roles: ["PROOFREADER"],
      permissions: ["UPLOAD", "EDIT"],
      // -----
      userId: "afea4c1f-b685-461e-aa6d-a3ebdd1640f2",
    },
  ]);
};

export default { execute };
