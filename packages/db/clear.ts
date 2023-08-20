import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { mediaBanners } from "./schema/mediaBanners";
import { mediaChapterComments, mediaChapters } from "./schema/mediaChapters";
import { mediaCovers } from "./schema/mediaCovers";
import { medias } from "./schema/medias";
import { mediaTags, tags } from "./schema/mediaTags";
import { mediaTitles } from "./schema/mediaTitles";
import { mediaTrackers, trackers } from "./schema/mediaTrackers";
import {
  accounts,
  sessions,
  users,
  userSettings,
  verificationTokens,
} from "./schema/users";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
} else if (!process.env.NODE_ENV) {
  throw new Error("NODE_ENV is not set");
}

const db = drizzle(neon(process.env.DATABASE_URL!));

async function clear() {
  if (process.env.NODE_ENV === "development") {
    console.log("Clearing database...");
    await db
      .delete(mediaChapterComments)
      .then(() => console.log("mediaChapterComments deleted"))
      .catch(() => null);
    await db
      .delete(mediaChapters)
      .then(() => console.log("mediaChapters deleted"))
      .catch(() => null);
    await db
      .delete(mediaTags)
      .then(() => console.log("mediaTags deleted"))
      .catch(() => null);
    await db
      .delete(mediaTitles)
      .then(() => console.log("mediaTitles deleted"))
      .catch(() => null);
    await db
      .delete(mediaTrackers)
      .then(() => console.log("mediaTrackers deleted"))
      .catch(() => null);
    await db
      .delete(mediaCovers)
      .then(() => console.log("mediaCovers deleted"))
      .catch(() => null);
    await db
      .delete(mediaBanners)
      .then(() => console.log("mediaBanners deleted"))
      .catch(() => null);
    await db
      .delete(medias)
      .then(() => console.log("medias deleted"))
      .catch(() => null);
    await db
      .delete(trackers)
      .then(() => console.log("trackers deleted"))
      .catch(() => null);
    await db
      .delete(tags)
      .then(() => console.log("tags deleted"))
      .catch(() => null);
    await db
      .delete(accounts)
      .then(() => console.log("accounts deleted"))
      .catch(() => null);
    await db
      .delete(sessions)
      .then(() => console.log("sessions deleted"))
      .catch(() => null);
    await db
      .delete(verificationTokens)
      .then(() => console.log("verificationTokens deleted"))
      .catch(() => null);
    await db
      .delete(userSettings)
      .then(() => console.log("userSettings deleted"))
      .catch(() => null);
    await db
      .delete(users)
      .then(() => console.log("users deleted\n"))
      .catch(() => null);
  }
}

clear().catch((e) => {
  console.error(e);
  process.exit(1);
});
