import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { scanMembers } from "~/lib/db/schema/scanMembers";
import { scans } from "~/lib/db/schema/scans";

const execute = async (db: PostgresJsDatabase) => {
  await db.insert(scans).values({
    id: "6d0cd6b0-c794-47d2-a90a-cff5a54e60b6",
    // -----
    name: "AnimaRegia Scantrad",
    // -----,
    logo: "https://i.imgur.com/dMbgVY7.jpg",
    banner: "https://i.imgur.com/oLRLlT4.jpg",
    // -----,
    website: "https://animaregia.net/",
    discord: "https://discord.gg/T7XXzNN",
    email: "animaregia@live.com",
    // -----
    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
  });

  await db.insert(scanMembers).values([
    {
      id: "ac8441c2-22ac-4876-a1a1-2591b6483d89",
      // -----
      roles: ["OWNER", "TRANSLATOR", "PROOFREADER", "TYPESETTER"],
      permissions: ["UPLOAD", "EDIT", "DELETE"],
      // -----
      userId: "f1cfb3ad-3821-4fef-ac68-933594d44243",
    },
    {
      id: "151936cb-27b2-4694-9a2c-d7f875d72882",
      // -----
      roles: ["TRANSLATOR"],
      permissions: ["UPLOAD", "EDIT"],
      // -----
      userId: "92fdb5fd-9c1a-4ef9-92c3-6a6a5ae2e6fa",
    },
  ]);
};

export default { execute };
