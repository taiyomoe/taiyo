import { db } from "~/lib/server/db";

const execute = async () => {
  await db.scan.create({
    data: {
      id: "21064fcc-fa19-4ab8-b5fc-315f5e46b3e2",
      // -----
      name: "Kousen Scans",
      // -----
      creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      chapters: {
        connect: [
          { id: "eeecfe08-1813-4267-a51f-32463b2c4d5f" },
          { id: "7f12a84d-4a43-430c-aaca-c3b4eba0a8af" },
          { id: "99ddad2d-f566-4fa7-9da7-c9be91d432ef" },
          { id: "9bf674bb-9bdd-46e4-9be5-c98581e4ffae" },
          { id: "1ff589b6-fb23-46ed-be01-9f0048e37b27" },
          { id: "6a146382-5a6a-40f9-b1bf-8f7b86722eda" },
          { id: "382ebe6c-9995-4763-8c70-7e219172c17b" },
          { id: "89dd80a3-a138-4b42-b929-8231dd0cec91" },
          { id: "7ec3e583-b14f-4486-bc6c-a6fd000a2d0e" },
          { id: "d8f0ec3d-7d95-4e93-a86c-bcb15193f373" },
        ],
      },
    },
  });

  await db.scanMember.createMany({
    data: [
      {
        id: "c6fc1a65-42f1-4692-866a-f1a56cb50021",
        // -----
        roles: ["OWNER", "TRANSLATOR", "PROOFREADER", "TYPESETTER"],
        permissions: ["UPLOAD", "EDIT", "DELETE"],
        // -----
        userId: "54044138-275b-4248-8842-ee7a72d6c8a4",
      },
      {
        id: "5bd6da18-1fd9-44c3-a27a-8b967ee139a6",
        // -----
        roles: ["TRANSLATOR"],
        permissions: ["UPLOAD", "EDIT"],
        // -----
        userId: "3db8ea16-b5c2-48eb-937f-a7b346e19d29",
      },
    ],
  });
};

export default { execute };
