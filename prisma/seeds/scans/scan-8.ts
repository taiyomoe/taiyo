import type { PrismaClient } from "@prisma/client";

const execute = async (db: PrismaClient) => {
  await db.scan.create({
    data: {
      id: "2301e266-2162-4480-93bb-da510feafbbf",
      // -----
      name: "I Wish Scan",
      description: "É agora ou nunca.",
      // -----,
      banner: "https://i.imgur.com/rdrUVCh.png",
      // -----,
      website: "http://iwishscan.blogspot.com/",
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
  });
};

export default { execute };
