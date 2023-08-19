import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { users } from "../schema/users";

const execute = async (db: PostgresJsDatabase) => {
  await db.insert(users).values({
    id: "620d8198-abd3-4d84-9eee-e23de23c168c",
    // -----
    name: "test",
    email: "test@gmail.com",
  });
};

export default { execute };
