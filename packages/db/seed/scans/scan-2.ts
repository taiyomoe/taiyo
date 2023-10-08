import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { scanMembers } from "../../schema/scanMembers";
import { scans } from "../../schema/scans";

const execute = async (db: PostgresJsDatabase) => {
  await db.insert(scans).values({
    id: "518c833f-88e3-4672-8f43-01e465dd0659",
    // -----
    name: "Gekkou",
    // -----,
    logo: "",
    banner: "",
    // -----,
    website: "https://gekkou.com.br/",
    discord: "http://discord.gg/WfYn3zU",
    facebook: "https://www.facebook.com/gekkouscan",
    telegram: "https://t.me/gekkouscans",
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
