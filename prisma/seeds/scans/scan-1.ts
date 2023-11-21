import { db } from "~/lib/server/db";

const execute = async () => {
  await db.scan.create({
    data: {
      id: "1d035366-5832-47eb-bcec-fd7d1ddc2af1",
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
      // -----
      creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      chapters: {
        connect: [
          { id: "d1eafcb1-f35d-4dd4-9b41-9bc357b73fdc" },
          { id: "154ecf13-e4c5-4056-b3dc-cb4b870144ca" },
          { id: "6478fc84-63cc-4da4-8fc1-40ca232e7f97" },
          { id: "4db23979-cd28-4e4b-8b2d-dd33aa9ce2c1" },
          { id: "b5926713-535d-474f-a5d4-11d4e47811bf" },
          { id: "06343348-48f9-4600-ab62-8a117a325631" },
          { id: "230f49e7-4842-408d-a1d4-65b618805c28" },
          { id: "fd7379b8-3f14-41e7-9b48-e71fec63c0ab" },
          { id: "cd1843f9-df9f-4c75-8dc6-f89c76cae6d4" },
          { id: "d8c505a2-d3fa-4c93-9c02-185066d7dac3" },
        ],
      },
    },
  });

  await db.scanMember.createMany({
    data: [
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
    ],
  });
};

export default { execute };
