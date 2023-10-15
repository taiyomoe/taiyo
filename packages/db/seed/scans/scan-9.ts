import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { scanMembers } from "../../schema/scanMembers";
import { scans } from "../../schema/scans";

const execute = async (db: PostgresJsDatabase) => {
  await db.insert(scans).values({
    id: "d16c92aa-42eb-4901-b6a7-3deb4bf35e59",
    // -----
    name: "Neox Scans",
    description: "Tradução e Edição de mangás/manhwas com qualidade e rapidez!",
    // -----,
    logo: "https://i.imgur.com/3oHAciM.png",
    // -----,
    website: "https://neoxscan.net/",
    discord: "https://discord.com/invite/neoxscan",
    facebook: "https://www.facebook.com/NeoxScanlator/",
    // -----
    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
  });

  await db.insert(scanMembers).values([
    {
      id: "e7376258-d9fb-453f-a0c8-3688bac667a7",
      // -----
      roles: ["OWNER"],
      permissions: ["UPLOAD", "EDIT", "DELETE"],
      // -----
      userId: "8e27fec3-6218-440b-82ea-61a52373882e",
    },
    {
      id: "2144653c-3580-4a08-bcca-c06bd3a50758",
      // -----
      roles: ["TYPESETTER"],
      permissions: ["UPLOAD", "EDIT"],
      // -----
      userId: "bf8efe61-85c1-4880-b2ac-ccbfcf8fa987",
    },
  ]);
};

export default { execute };
