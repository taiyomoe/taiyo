import { type PrismaClient } from "@prisma/client";

const execute = async (db: PrismaClient) => {
  await db.scan.create({
    data: {
      id: "6d0cd6b0-c794-47d2-a90a-cff5a54e60b6",
      // -----
      name: "AnimaRegia Scantrad",
      // -----,
      logo: "https://i.imgur.com/dMbgVY7.jpg",
      banner: "https://i.imgur.com/oLRLlT4.jpg",
      // -----,
      website: "https://animaregia.net/",
      discord: "https://discord.gg/T7XXzNN",
      email: "animaregia@live.com",
      // -----
      creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      chapters: {
        connect: [
          { id: "70f21342-a865-48ae-b53f-d938a59ce64f" },
          { id: "f999fdd4-8c10-4911-882f-2b04c4849f6a" },
          { id: "edeed4da-4286-4d87-8f6a-400aa056f513" },
          { id: "6b4c22c5-6607-4e7a-88f7-4268d12e6467" },
          { id: "4e035529-3e7a-4483-8b2c-6e2659a3f160" },
          { id: "2d861002-c839-4ae5-9b25-865a785dadca" },
          { id: "10dba0dc-56e9-4d5f-89d0-ffacc5b21ae8" },
          { id: "6d4883b7-33af-4379-bdc7-3846047402e8" },
          { id: "9a5bd269-3005-49e4-a3ed-04898a4b2004" },
          { id: "6e0d9d8b-162b-4727-8d1f-14ba1f51585f" },
        ],
      },
    },
  });

  await db.scanMember.createMany({
    data: [
      {
        id: "ac8441c2-22ac-4876-a1a1-2591b6483d89",
        // -----
        roles: ["OWNER", "TRANSLATOR", "PROOFREADER", "TYPESETTER"],
        permissions: ["UPLOAD", "EDIT", "DELETE"],
        // -----
        userId: "f1cfb3ad-3821-4fef-ac68-933594d44243",
      },
      {
        id: "151936cb-27b2-4694-9a2c-d7f875d72882",
        // -----
        roles: ["TRANSLATOR"],
        permissions: ["UPLOAD", "EDIT"],
        // -----
        userId: "92fdb5fd-9c1a-4ef9-92c3-6a6a5ae2e6fa",
      },
    ],
  });
};

export default { execute };
