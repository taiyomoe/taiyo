import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { scanMembers } from "~/lib/db/schema/scanMembers";
import { scans } from "~/lib/db/schema/scans";

const execute = async (db: PostgresJsDatabase) => {
  await db.insert(scans).values({
    id: "3a0db5c7-d3c8-463b-a10e-7fe1fd5b0c60",
    // -----
    name: "Gekkou",
    // -----,
    logo: "https://i.imgur.com/TgPHaet.jpg",
    // -----,
    website: "https://gekkou.com.br/",
    discord: "http://discord.gg/WfYn3zU",
    facebook: "https://www.facebook.com/gekkouscan",
    telegram: "https://t.me/gekkouscans",
    // -----
    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
  });

  await db.insert(scanMembers).values([
    {
      id: "f9d9c553-6fdd-439b-bcca-2913a128fe25",
      // -----
      roles: ["ADMIN"],
      permissions: ["UPLOAD", "EDIT", "DELETE"],
      // -----
      userId: "340dfc72-fa23-4941-a925-91d6088dbc41",
    },
    {
      id: "fdc0886f-e3a6-4d7d-bce5-582810b1968c",
      // -----
      roles: ["ADMIN"],
      permissions: ["UPLOAD", "EDIT", "DELETE"],
      // -----
      userId: "f29c8026-15cf-49dd-a899-1d33468ab9e2",
    },
    {
      id: "d751eb4d-5ed7-4544-8963-75bc12edc35d",
      // -----
      roles: ["ADMIN", "QUALITY_CHECKER"],
      permissions: ["UPLOAD", "EDIT", "DELETE"],
      // -----
      userId: "8d4d60de-a983-43c1-bafb-4d2a19f7fff8",
    },
  ]);
};

export default { execute };
