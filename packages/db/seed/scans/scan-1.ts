import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { scanMembers } from "../../schema/scanMembers";
import { scans } from "../../schema/scans";

const execute = async (db: PostgresJsDatabase) => {
  await db.insert(scans).values({
    id: "b8c5f433-df8a-4bbf-9269-259ccc042c9c",
    // -----
    name: "Drope Scan",
    description:
      "A Drope Scan é um grupo de scanlation brasileiro, focada em trazer para o português os mais diferentes gêneros de obras!",
    // -----,
    logo: "https://i.imgur.com/ClFVGQe.jpg",
    banner: "https://i.imgur.com/Kh1LtbJ.jpg",
    // -----,
    website: "https://dropescan.com",
    discord: "https://discord.com/invite/drope-100-jesus-487352833834876931",
    facebook: "https://www.facebook.com/DROPEscanlator",
  });

  await db.insert(scanMembers).values([
    {
      id: "40a26617-29d3-45b7-b22b-1f4241d55bb8",
      // -----
      roles: ["OWNER"],
      permissions: ["UPLOAD", "EDIT", "DELETE"],
      // -----
      userId: "5afbbfef-0a99-4be1-8080-cf856786290f",
    },
    {
      id: "3240d391-460e-4b19-9696-88924f153602",
      // -----
      roles: ["ADMIN"],
      permissions: ["UPLOAD", "EDIT", "DELETE"],
      // -----
      userId: "1f36d9db-3187-449e-ab95-5bebb7d25bd2",
    },
    {
      id: "d5ed851e-a13b-4ce0-94a7-499c4505433e",
      // -----
      roles: ["QUALITY_CHECKER", "TYPESETTER"],
      permissions: ["UPLOAD", "EDIT"],
      // -----
      userId: "2df975c5-2354-4273-b9fb-d0648b9535fb",
    },
    {
      id: "1d7d4858-28dc-4f37-a6b7-633509a22e29",
      // -----
      roles: ["TYPESETTER"],
      permissions: ["UPLOAD", "EDIT"],
      // -----
      userId: "709e7044-bc20-4241-abc3-eef6fd5b88a3",
    },
  ]);
};

export default { execute };
