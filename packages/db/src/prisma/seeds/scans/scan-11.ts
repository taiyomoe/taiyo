import { db } from "../../.."

const execute = async () => {
  await db.scan.create({
    data: {
      id: "642f18b8-df9b-4b13-a4dc-93bba10393df",
      // -----
      name: "Saturn Scan",
      // -----,
      website: "http://saturnscans.blogspot.com/",
      // -----
      creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      chapters: {
        connect: [
          { id: "89b0b209-3653-4780-9cbf-90a35803c38a" },
          { id: "abcded63-ded5-44d3-aef7-fa368d653347" },
          { id: "c6206040-95a8-4802-b12b-c631ef7e859d" },
          { id: "bd5f1cac-95b1-4f68-a314-144898e5cc07" },
          { id: "69884783-18c4-48c8-9320-c00cef8cb873" },
          { id: "6d54a98a-43c4-4821-bb4d-0ce48e99c8f7" },
          { id: "cd19eaa8-aaa9-4565-b1e1-59bccee18c30" },
          { id: "90b25b8e-572e-42ab-b30a-3075180bbe6c" },
          { id: "6eca2c2e-d63b-4250-a13d-86009fee5b4f" },
          { id: "ff8a9509-2b26-43c3-9701-e71cadaacbb2" },
        ],
      },
    },
  })

  await db.scanMember.createMany({
    data: [
      {
        id: "567b6021-2b59-45d0-b5a4-5f013805e6a2",
        // -----
        roles: ["OWNER", "TRANSLATOR", "TYPESETTER"],
        permissions: ["UPLOAD", "EDIT", "DELETE"],
        // -----
        userId: "6b8b87eb-382c-4fc1-9da6-a6e8b21f6be8",
      },
      {
        id: "2ec4f418-e49a-4b24-8a2e-998aebb6b809",
        // -----
        roles: ["PROOFREADER"],
        permissions: ["UPLOAD", "EDIT"],
        // -----
        userId: "afea4c1f-b685-461e-aa6d-a3ebdd1640f2",
      },
    ],
  })
}

export default { execute }
