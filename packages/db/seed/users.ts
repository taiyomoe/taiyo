import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { users } from "../schema/users";

const execute = async (db: PostgresJsDatabase) => {
  await db.insert(users).values([
    {
      id: "620d8198-abd3-4d84-9eee-e23de23c168c",
      // -----
      name: "rdx",
      email: "rdx@gmail.com",
    },
    {
      id: "87b0282f-b2cf-4a72-bcee-cda470d25d81",
      // -----
      name: "Mel",
      email: "mel@gmail.com",
    },
    {
      id: "d3a7374f-271a-4947-af07-59a4484b9ce6",
      // -----
      name: "Tsuki",
      email: "tsuki@gmail.com",
    },
    {
      id: "a0d98623-7c94-4d31-b757-1b3ad052d0f1",
      // -----
      name: "Hirugaru",
      email: "hirugaru@gmail.com",
    },
    {
      id: "0084893b-2226-462d-8267-97414a03e441",
      // -----
      name: "Ge",
      email: "ge@gmail.com",
    },
    {
      id: "8fcbf1de-b31d-4625-9f6e-086c10910a11",
      // -----
      name: "Lalalatiozao",
      email: "lalalatiozao@gmail.com",
    },
    {
      id: "2d947dd6-e2e9-48f4-a194-6b1657271646",
      // -----
      name: "Calvo",
      email: "calvo@gmail.com",
    },
    {
      id: "6ee2c8c0-b884-4536-a35e-145fd97e21f4",
      // -----
      name: "Fabio",
      email: "fabio@gmail.com",
    },
    {
      id: "2fd16b31-3d92-4540-96e9-f11a66b49718",
      // -----
      name: "Anjo",
      email: "anjo@gmail.com",
    },
    {
      id: "1901629d-3c71-46c6-9f0b-57fdaefa1a7e",
      // -----
      name: "Hipon",
      email: "hipon@gmail.com",
    },
    {
      id: "7673491b-591e-4385-97c5-46bc7f41c83b",
      // -----
      name: "Argen-chan",
      email: "argenchan@gmail.com",
    },
    {
      id: "efd1f5de-c649-414a-b846-4650575fe274",
      // -----
      name: "Conrad",
      email: "conrad@gmail.com",
    },
    {
      id: "5222ca52-25bf-4bbf-85f5-a94c1177397a",
      // -----
      name: "Getauscht",
      email: "getauscht@gmail.com",
    },
  ]);
};

export default { execute };
