import { db } from "~/lib/server/db"

const execute = async () => {
  await db.scan.create({
    data: {
      id: "d16c92aa-42eb-4901-b6a7-3deb4bf35e59",
      // -----
      name: "Neox Scans",
      description:
        "Tradução e Edição de mangás/manhwas com qualidade e rapidez!",
      // -----,
      logo: "https://i.imgur.com/3oHAciM.png",
      // -----,
      website: "https://neoxscan.net/",
      discord: "https://discord.com/invite/neoxscan",
      facebook: "https://www.facebook.com/NeoxScanlator/",
      // -----
      creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      chapters: {
        connect: [
          { id: "a78db038-7a71-4e4d-8078-132363b704ac" },
          { id: "d6cc6181-08c0-470a-92f7-58c1f2b3dee8" },
          { id: "935c0106-8886-4769-9565-ca3f4a24c91d" },
          { id: "26ffc746-31fb-4bb6-bb64-5a4ff5f2b0fb" },
          { id: "27b363f4-5db5-4b4a-9ad7-9236e8edebff" },
          { id: "fba438af-7ad9-4e0a-ba58-787ef3fa6554" },
          { id: "6cafe3bb-3d85-4539-8108-152c42a71c5d" },
          { id: "8695daba-b7e1-4fe6-a79c-4c8c49336a2b" },
          { id: "23f65c36-66eb-4407-97bb-66cb51ea15a5" },
          { id: "86ee60d2-7ba7-4ec6-bd04-1407962c8624" },
        ],
      },
    },
  })

  await db.scanMember.createMany({
    data: [
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
    ],
  })
}

export default { execute }
