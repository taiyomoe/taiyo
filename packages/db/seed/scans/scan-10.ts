import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { scanMembers } from "../../schema/scanMembers";
import { scans } from "../../schema/scans";

const execute = async (db: PostgresJsDatabase) => {
  await db.insert(scans).values({
    id: "fbf322ef-daa9-496f-8903-a36013a67d02",
    // -----
    name: "Saikai Scans",
    description:
      "Traduções, Revisões e Edições dos melhores conteúdos para vocês.",
    // -----,
    logo: "https://i.imgur.com/scRpT3V.png",
    banner: "https://i.imgur.com/wYek1z5.png",
    // -----,
    website: "https://saikaiscans.net/",
    discord: "https://discord.gg/cmQuwHB7rf",
    facebook: "https://www.facebook.com/saikaiscan/",
    instagram: "https://www.instagram.com/saikaioficial/",
    youtube: "https://www.youtube.com/saikai",
  });

  await db.insert(scanMembers).values([
    {
      id: "495bfc75-828d-474f-9d6b-e7cea205d285",
      // -----
      roles: ["OWNER", "TRANSLATOR", "TYPESETTER"],
      permissions: ["UPLOAD", "EDIT", "DELETE"],
      // -----
      userId: "e97f1d3d-22a5-4fa8-ac37-aa9569be03a5",
    },
    {
      id: "3dd4db20-cc01-4050-9b91-189198564abe",
      // -----
      roles: ["PROOFREADER"],
      permissions: ["UPLOAD", "EDIT"],
      // -----
      userId: "0658d346-338b-49d3-9939-7ea5b9069623",
    },
    {
      id: "6b01f519-7a55-4b83-8418-1ce2264bbd1b",
      // -----
      roles: ["QUALITY_CHECKER", "CLEANER"],
      permissions: ["UPLOAD", "EDIT"],
      // -----
      userId: "dc345ee8-12c5-4f18-8579-774cac5f225b",
    },
    {
      id: "402a5a5e-ed05-461c-984d-a254ff65d2fc",
      // -----
      roles: ["RAW_PROVIDER"],
      permissions: ["UPLOAD", "EDIT"],
      // -----
      userId: "2885b836-4a4f-41e0-939a-5cf816cb3612",
    },
  ]);
};

export default { execute };
