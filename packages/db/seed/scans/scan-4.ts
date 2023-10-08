import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { scanMembers } from "../../schema/scanMembers";
import { scans } from "../../schema/scans";

const execute = async (db: PostgresJsDatabase) => {
  await db.insert(scans).values({
    id: "c021853b-0408-4698-9f50-4d67dab808f6",
    // -----
    name: "Kousen Scans",
  });

  await db.insert(scanMembers).values([
    {
      id: "c6fc1a65-42f1-4692-866a-f1a56cb50021",
      // -----
      roles: ["OWNER", "TRANSLATOR", "PROOFREADER", "TYPESETTER"],
      permissions: ["UPLOAD", "EDIT", "DELETE"],
      // -----
      userId: "54044138-275b-4248-8842-ee7a72d6c8a4",
    },
    {
      id: "5bd6da18-1fd9-44c3-a27a-8b967ee139a6",
      // -----
      roles: ["TRANSLATOR"],
      permissions: ["UPLOAD", "EDIT"],
      // -----
      userId: "3db8ea16-b5c2-48eb-937f-a7b346e19d29",
    },
  ]);
};

export default { execute };
