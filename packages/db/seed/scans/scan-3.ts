import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { scans } from "../../schema/scans";

const execute = async (db: PostgresJsDatabase) => {
  await db.insert(scans).values({
    id: "601f0be8-cf7f-401b-a7b1-779a8b07d61e",
    // -----
    name: "OPEX",
    description: "De fã para fã: o maior site focado em One Piece do Brasil.",
    // -----,
    logo: "",
    banner: "",
    // -----,
    website: "https://onepieceex.net",
    twitter: "https://twitter.com/onepieceex",
    instagram: "https://www.instagram.com/mister27opex",
  });
};

export default { execute };
