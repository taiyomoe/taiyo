import { db } from "../../.."

const execute = async () => {
  await db.scan.create({
    data: {
      id: "2be06bd9-bddf-4029-8536-78108f420f30",
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
      // -----
      creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      chapters: {
        connect: [
          { id: "c767d5bc-5e90-478b-9aa5-02d59a404199" },
          { id: "12b4285a-ac0f-44d6-a07c-28fcbfb97a95" },
          { id: "29fb9c93-42d7-4660-8c76-ddf6a3a9c92b" },
          { id: "57afc965-ab41-46c1-8632-34513597961f" },
          { id: "14dbd09a-2bfa-4e0e-adc6-fc483ae43900" },
          { id: "c6a2fa04-45a2-4214-a371-170505c113e2" },
          { id: "c9bd98ec-3c5c-49a7-a140-91c2bc29ed73" },
          { id: "d31ec738-32c9-4acd-9586-3d4c4d141bb9" },
          { id: "828aef3e-bf91-4fb6-bbea-2475fcb6c71a" },
          { id: "b6c43ec3-5cc2-4b40-964d-57e154782a40" },
        ],
      },
    },
  })

  await db.scanMember.createMany({
    data: [
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
    ],
  })
}

export default { execute }
