import { db } from "../../.."

const execute = async () => {
  await db.scan.create({
    data: {
      id: "a9f2139e-54fc-4524-8688-ed7b46920f5d",
      // -----
      name: "Shin Sekai Scans",
      description: "É agora ou nunca.",
      // -----,
      website: "https://shinsekaiscans.wordpress.com/",
      twitter: "https://twitter.com/ShinSekaiscans",
      // -----
      creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      chapters: {
        connect: [
          { id: "b2cfca53-c90c-4c42-a69f-a2dca025cca8" },
          { id: "356711ba-45db-49b8-b4ac-cc03aa674bbd" },
          { id: "35c39110-f9f8-4d42-ac82-bc43716071e5" },
          { id: "4163393f-4244-4c74-bf18-34b407d692d2" },
          { id: "f36096b2-83ce-42c8-ad93-53c55772cc91" },
          { id: "428717ba-cea4-446c-ba38-f3ea7e7ff1cc" },
          { id: "e22edd16-30b7-437e-9a38-38542f283e96" },
          { id: "1916d95e-13f3-4e4b-b8e5-63af74935aca" },
          { id: "558ddbab-24b6-4638-88d1-bd7588cf2393" },
          { id: "aaacb6a4-20a3-4486-9c59-1825e94fc49e" },
        ],
      },
    },
  })

  await db.scanMember.createMany({
    data: [
      {
        id: "d921ff40-e70a-4623-a2e5-17c7a3f9a7f5",
        // -----
        roles: ["TRANSLATOR", "TYPESETTER"],
        permissions: ["UPLOAD", "EDIT"],
        // -----
        userId: "e368b9b5-fc7e-4235-9f08-9902db00a691",
      },
      {
        id: "f9580aec-dcae-4ad7-8fe3-078124bf14fc",
        // -----
        roles: ["PROOFREADER"],
        permissions: ["UPLOAD", "EDIT"],
        // -----
        userId: "4ede745e-519d-4d09-b930-d91af930f12c",
      },
    ],
  })
}

export default { execute }
