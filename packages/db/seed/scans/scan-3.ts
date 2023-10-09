import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { scans } from "../../schema/scans";

const execute = async (db: PostgresJsDatabase) => {
  await db.insert(scans).values({
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
  });
};

export default { execute };
