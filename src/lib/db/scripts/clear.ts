import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { mediaBanners } from "~/lib/db/schema/mediaBanners";
import { mediaChapterComments } from "~/lib/db/schema/mediaChapterComments";
import { mediaChapters } from "~/lib/db/schema/mediaChapters";
import { mediaChapterScans } from "~/lib/db/schema/mediaChapterScans";
import { mediaCovers } from "~/lib/db/schema/mediaCovers";
import { medias } from "~/lib/db/schema/medias";
import { mediaTags } from "~/lib/db/schema/mediaTags";
import { mediaTitles } from "~/lib/db/schema/mediaTitles";
import { mediaTrackers } from "~/lib/db/schema/mediaTrackers";
import { scans } from "~/lib/db/schema/scans";
import { tags } from "~/lib/db/schema/tags";
import { trackers } from "~/lib/db/schema/trackers";
import {
  accounts,
  sessions,
  users,
  userSettings,
  verificationTokens,
} from "~/lib/db/schema/users";

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
      .delete(mediaChapterScans)
      .then(() => console.log("mediaChapterScans deleted"))
      .catch(() => null);
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
      .delete(scans)
      .then(() => console.log("scans deleted"))
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
      .then(() => console.log("users deleted"))
      .catch(() => null);
  }
}

clear().catch((e) => {
  console.error(e);
  process.exit(1);
});
