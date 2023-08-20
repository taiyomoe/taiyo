import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import media1 from "./seed/media-1";
import media2 from "./seed/media-2";
import media3 from "./seed/media-3";
import media4 from "./seed/media-4";
import media5 from "./seed/media-5";
import media6 from "./seed/media-6";
import media7 from "./seed/media-7";
import media8 from "./seed/media-8";
import media9 from "./seed/media-9";
import media10 from "./seed/media-10";
import roles from "./seed/roles";
import trackers from "./seed/trackers";
import user1 from "./seed/user-1";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
} else if (!process.env.NODE_ENV) {
  throw new Error("NODE_ENV is not set");
}

const db = drizzle(neon(process.env.DATABASE_URL!));

async function seed() {
  console.log("Seeding database.....");

  await trackers.execute(db).then(() => console.log("Trackers seeded"));
  await roles.execute(db).then(() => console.log("Roles seeded"));

  if (process.env.NODE_ENV === "development") {
    await user1.execute(db).then(() => console.log("User 1 seeded"));
    await media1.execute(db).then(() => console.log("Media 1 seeded"));
    await media2.execute(db).then(() => console.log("Media 2 seeded"));
    await media3.execute(db).then(() => console.log("Media 3 seeded"));
    await media4.execute(db).then(() => console.log("Media 4 seeded"));
    await media5.execute(db).then(() => console.log("Media 5 seeded"));
    await media6.execute(db).then(() => console.log("Media 6 seeded"));
    await media7.execute(db).then(() => console.log("Media 7 seeded"));
    await media8.execute(db).then(() => console.log("Media 8 seeded"));
    await media9.execute(db).then(() => console.log("Media 9 seeded"));
    await media10.execute(db).then(() => console.log("Media 10 seeded"));
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
