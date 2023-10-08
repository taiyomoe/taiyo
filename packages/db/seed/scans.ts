import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { scanMembers } from "../schema/scanMembers";
import { scans } from "../schema/scans";

const execute = async (db: PostgresJsDatabase) => {
  await db.insert(scans).values([
    {
      id: "de2dccdd-24eb-4da2-a14c-1d7aac56296e",
      // -----
      name: "Neox Scans",
      description:
        "Tradução e Edição de mangás/manhwas com qualidade e rapidez!",
      // -----
      logo: "https://i.imgur.com/3oHAciM.png",
      // -----
      website: "https://neoxscan.net/",
      discord: "https://discord.com/invite/neoxscan",
      facebook: "https://www.facebook.com/NeoxScanlator/",
    },
    {
      id: "5ed64071-f409-4d52-aec5-5539d629c293",
      // -----
      name: "Mecha-Mangás-",
      description:
        "A scan foi criada em 2021 e esse blog foi tardiamente feito para divulgar melhor os projetos da scan. Além de mangás, traduzimos animes de diversos tipos. Estamos sempre procurando pessoas novas pra trabalhar conosco, isso se elas demonstrarem interesse.",
      // -----
      logo: "https://i.imgur.com/VEuMty2.jpg",
      banner: "https://i.imgur.com/7yNz1ud.png",
      // -----
      website: "https://mecha-mangas.blogspot.com/",
      discord: "https://discord.gg/n77vtnTymb",
      twitter: "https://twitter.com/Mangas_Mecha_",
    },
    {
      id: "c0337ace-71ce-476d-9b74-73d64df4bd86",
      // -----
      name: "Morro dos Scans",
      description:
        "Uma favela que traz lazer e um pouco da cultura asiática pra todo mundo curtir.",
      // -----
      logo: "https://i.imgur.com/rpL0L3M.jpg",
      banner: "https://i.imgur.com/D7H5WFH.jpg",
      // -----
      discord: "https://discord.com/invite/fKEemdj",
      twitter: "https://twitter.com/morrodosscans_",
    },
    {
      id: "1803cfc1-fdab-46f5-b468-8ddc71203996",
      // -----
      name: "Drope Scan",
      description:
        "A Drope Scan é um grupo de scanlation brasileiro, focada em trazer para o português os mais diferentes gêneros de obras!",
      // -----
      logo: "https://i.imgur.com/ClFVGQe.jpg",
      banner: "https://i.imgur.com/Kh1LtbJ.jpg",
      // -----
      website: "https://dropescan.com/",
      discord: "https://discord.com/invite/drope-100-jesus-487352833834876931",
      facebook: "https://www.facebook.com/DROPEscanlator/",
    },
  ]);

  await db.insert(scanMembers).values([
    {
      id: "887130be-3a3d-4f68-8ef3-db79acb1b28c",
      // -----
      roles: ["OWNER"],
      permissions: ["UPLOAD", "EDIT", "DELETE"],
      // -----
      userId: "87b0282f-b2cf-4a72-bcee-cda470d25d81",
    },
    {
      id: "d744c05b-32a9-438d-9e56-093ed5f37d4d",
      // -----
      roles: ["TYPESETTER"],
      permissions: ["UPLOAD", "EDIT"],
      // -----
      userId: "d3a7374f-271a-4947-af07-59a4484b9ce6",
    },
    {
      id: "87a8f399-452c-406f-91b4-800c54b98874",
      // -----
      roles: ["OWNER"],
      permissions: ["UPLOAD", "EDIT", "DELETE"],
      // -----
      userId: "a0d98623-7c94-4d31-b757-1b3ad052d0f1",
    },
    {
      id: "2cebb7d4-fd13-4334-a1e5-9d5557057551",
      // -----
      roles: ["TRANSLATOR", "TYPESETTER"],
      permissions: ["UPLOAD", "EDIT"],
      // -----
      userId: "0084893b-2226-462d-8267-97414a03e441",
    },
    {
      id: "713c0e5e-4671-4278-9219-f80238d4a235",
      // -----
      roles: ["TRANSLATOR", "TYPESETTER"],
      permissions: ["UPLOAD", "EDIT"],
      // -----
      userId: "8fcbf1de-b31d-4625-9f6e-086c10910a11",
    },
    {
      id: "5b160287-6230-455a-8d1e-9f574f8d5253",
      // -----
      roles: ["OWNER"],
      permissions: ["UPLOAD", "EDIT", "DELETE"],
      // -----
      userId: "2d947dd6-e2e9-48f4-a194-6b1657271646",
    },
    {
      id: "621f2fce-4d47-48e0-9e58-a8e07cb76d8e",
      // -----
      roles: ["TYPESETTER"],
      permissions: ["UPLOAD", "EDIT"],
      // -----
      userId: "6ee2c8c0-b884-4536-a35e-145fd97e21f4",
    },
    {
      id: "fee8a740-fc65-4c19-a938-ee3911eade7f",
      // -----
      roles: ["ADMIN"],
      permissions: ["UPLOAD", "EDIT", "DELETE"],
      // -----
      userId: "2fd16b31-3d92-4540-96e9-f11a66b49718",
    },
    {
      id: "a2de6f50-3f93-4ba9-905a-c930309326f0",
      // -----
      roles: ["OWNER"],
      permissions: ["UPLOAD", "EDIT", "DELETE"],
      // -----
      userId: "1901629d-3c71-46c6-9f0b-57fdaefa1a7e",
    },
    {
      id: "5e078713-de57-48aa-abaa-93e79b753d72",
      // -----
      roles: ["ADMIN"],
      permissions: ["UPLOAD", "EDIT", "DELETE"],
      // -----
      userId: "7673491b-591e-4385-97c5-46bc7f41c83b",
    },
    {
      id: "12d47d19-db49-4893-908e-cd5fba1e970b",
      // -----
      roles: ["QUALITY_CHECKER", "PROOFREADER"],
      permissions: ["UPLOAD", "EDIT"],
      // -----
      userId: "efd1f5de-c649-414a-b846-4650575fe274",
    },
    {
      id: "31c80c11-a816-4d07-9458-e094f39054df",
      // -----
      roles: ["TYPESETTER"],
      permissions: ["UPLOAD", "EDIT"],
      // -----
      userId: "5222ca52-25bf-4bbf-85f5-a94c1177397a",
    },
  ]);
};

export default { execute };
