import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import media1 from "../seed/medias/media-1";
import media2 from "../seed/medias/media-2";
import media3 from "../seed/medias/media-3";
import media4 from "../seed/medias/media-4";
import media5 from "../seed/medias/media-5";
import media6 from "../seed/medias/media-6";
import media7 from "../seed/medias/media-7";
import media8 from "../seed/medias/media-8";
import media9 from "../seed/medias/media-9";
import media10 from "../seed/medias/media-10";
import scan1 from "../seed/scans/scan-1";
import scan2 from "../seed/scans/scan-2";
import scan3 from "../seed/scans/scan-3";
import scan4 from "../seed/scans/scan-4";
import scan5 from "../seed/scans/scan-5";
import scan6 from "../seed/scans/scan-6";
import scan7 from "../seed/scans/scan-7";
import scan8 from "../seed/scans/scan-8";
import scan9 from "../seed/scans/scan-9";
import scan10 from "../seed/scans/scan-10";
import scan11 from "../seed/scans/scan-11";
import tags from "../seed/tags";
import trackers from "../seed/trackers";
import users from "../seed/users";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
} else if (!process.env.NODE_ENV) {
  throw new Error("NODE_ENV is not set");
}

const db = drizzle(neon(process.env.DATABASE_URL!));

async function seed() {
  console.log("Seeding database.....");

  if (process.env.NODE_ENV === "development") {
    await users.execute(db).then(() => console.log("Users seeded"));
  }

  await trackers.execute(db).then(() => console.log("Trackers seeded"));
  await tags.execute(db).then(() => console.log("Tags seeded"));

  if (process.env.NODE_ENV === "development") {
    // Scans
    await scan1.execute(db).then(() => console.log("Scan 1 seeded"));
    await scan2.execute(db).then(() => console.log("Scan 2 seeded"));
    await scan3.execute(db).then(() => console.log("Scan 3 seeded"));
    await scan4.execute(db).then(() => console.log("Scan 4 seeded"));
    await scan5.execute(db).then(() => console.log("Scan 5 seeded"));
    await scan6.execute(db).then(() => console.log("Scan 6 seeded"));
    await scan7.execute(db).then(() => console.log("Scan 7 seeded"));
    await scan8.execute(db).then(() => console.log("Scan 8 seeded"));
    await scan9.execute(db).then(() => console.log("Scan 9 seeded"));
    await scan10.execute(db).then(() => console.log("Scan 10 seeded"));
    await scan11.execute(db).then(() => console.log("Scan 11 seeded"));

    // Medias
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
