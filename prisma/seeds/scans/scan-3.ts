import type { PrismaClient } from "@prisma/client";

const execute = async (db: PrismaClient) => {
  await db.scan.create({
    data: {
      id: "b82802a5-c837-4426-bac5-93d80fdfedf7",
      // -----
      name: "OPEX",
      description: "De fã para fã: o maior site focado em One Piece do Brasil.",
      // -----,
      logo: "https://i.imgur.com/rSDmlHq.png",
      banner: "https://i.imgur.com/13N7kAY.jpg",
      // -----,
      website: "https://onepieceex.net",
      twitter: "https://twitter.com/onepieceex",
      instagram: "https://www.instagram.com/mister27opex",
      // -----
      creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      chapters: {
        connect: [
          { id: "910d2723-7a4a-4feb-9702-a46ec2703a70" },
          { id: "4762167e-5290-480d-b1aa-b2c0a1b7632b" },
          { id: "ab31fddb-9520-4366-80c2-ab497d9cef96" },
          { id: "78ce6765-d29f-4ae4-bf90-1e7f864d4d8a" },
          { id: "c80863e6-4c2b-4814-8f97-53385e950b65" },
          { id: "d2323cdb-fdfd-455f-b559-8fb24e3c3b21" },
          { id: "9bf82850-6930-4f66-bdfb-b8e4e6e84540" },
          { id: "84165008-0067-4373-b734-60fcec07c5d2" },
          { id: "ee5506cf-a811-40c5-9ae9-fc58f76c06b4" },
          { id: "a5d0f55b-2c5d-4810-8aa0-43d3ca8e5e83" },
          { id: "92f28411-1d29-4afc-a05e-203dd21d548d" },
        ],
      },
    },
  });
};

export default { execute };
