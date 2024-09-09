import { db } from "../../../"

const execute = async () => {
  await db.scan.create({
    data: {
      id: "6c6a8a30-701c-44de-bcab-3e567587870f",
      // -----
      name: "Kyodai Mangás",
      // -----,
      discord: "https://discord.gg/9Mk8uz6aRK",
      // -----
      creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      chapters: {
        connect: [
          { id: "4b31f537-0b93-423d-9a52-8283bf6db5b7" },
          { id: "2397d097-7c5b-4449-bde1-da2ba627521c" },
          { id: "b1ede5f2-cdbd-408a-b631-986a8a7832f2" },
          { id: "961e39d7-1c09-4c76-ba76-b0c213b06c93" },
          { id: "ef73a310-c475-47a0-9d79-deee554c161b" },
          { id: "45d8a770-71ff-43c3-bf5d-fe3f73bafc66" },
          { id: "34aa1338-fb96-491e-a970-329768ad0989" },
          { id: "387f7f87-aa2f-4c41-8ca8-6298466fb0a1" },
          { id: "96842b24-97b9-4afd-a93e-0787e861c71d" },
          { id: "84dbf28a-0f8f-41c3-b20f-2dd0a3b22255" },
        ],
      },
    },
  })

  await db.scanMember.createMany({
    data: [
      {
        id: "83a47a78-50cb-4b52-bf12-2365e8aa2fe3",
        // -----
        roles: ["OWNER", "QUALITY_CHECKER", "TYPESETTER"],
        permissions: ["UPLOAD", "EDIT", "DELETE"],
        // -----
        userId: "81825dd9-01c5-4a8a-9882-f63fd53cc163",
      },
      {
        id: "395a1f4b-4260-4a1a-ad46-48e6f649cefa",
        // -----
        roles: ["TRANSLATOR"],
        permissions: ["UPLOAD", "EDIT"],
        // -----
        userId: "6c60a451-4a2d-4179-9b76-7be17d661f53",
      },
    ],
  })
}

export default { execute }
