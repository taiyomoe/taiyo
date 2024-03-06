import { db } from "../../.."

const execute = async () => {
  await db.scan.create({
    data: {
      id: "3a0db5c7-d3c8-463b-a10e-7fe1fd5b0c60",
      // -----
      name: "Gekkou",
      // -----,
      logo: "https://i.imgur.com/TgPHaet.jpg",
      // -----,
      website: "https://gekkou.com.br/",
      discord: "http://discord.gg/WfYn3zU",
      facebook: "https://www.facebook.com/gekkouscan",
      telegram: "https://t.me/gekkouscans",
      // -----
      creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      chapters: {
        connect: [
          { id: "b3f20050-8bf7-435e-b27b-64da7c888b06" },
          { id: "425f0866-917d-45c6-9774-df41e58bf0e0" },
          { id: "1381c258-799e-4682-8e30-c4a0d543c6c8" },
          { id: "a46e690c-dafa-48df-a16a-07b67fa68659" },
          { id: "a11e58db-b1fa-4560-843b-670460f6b30d" },
          { id: "a608e041-6cc9-441f-8e8f-66380606c56c" },
          { id: "a3a7ddcd-9164-40fa-9f19-6fac582498e4" },
          { id: "1471814d-f9e0-4ee6-a9c5-a31d1b541684" },
          { id: "1681f340-7e46-43d6-a32a-607939c9fb65" },
          { id: "fcab7fbe-f1f1-4204-bd84-2e1df114006f" },
        ],
      },
    },
  })

  await db.scanMember.createMany({
    data: [
      {
        id: "f9d9c553-6fdd-439b-bcca-2913a128fe25",
        // -----
        roles: ["ADMIN"],
        permissions: ["UPLOAD", "EDIT", "DELETE"],
        // -----
        userId: "340dfc72-fa23-4941-a925-91d6088dbc41",
      },
      {
        id: "fdc0886f-e3a6-4d7d-bce5-582810b1968c",
        // -----
        roles: ["ADMIN"],
        permissions: ["UPLOAD", "EDIT", "DELETE"],
        // -----
        userId: "f29c8026-15cf-49dd-a899-1d33468ab9e2",
      },
      {
        id: "d751eb4d-5ed7-4544-8963-75bc12edc35d",
        // -----
        roles: ["ADMIN", "QUALITY_CHECKER"],
        permissions: ["UPLOAD", "EDIT", "DELETE"],
        // -----
        userId: "8d4d60de-a983-43c1-bafb-4d2a19f7fff8",
      },
    ],
  })
}

export default { execute }
