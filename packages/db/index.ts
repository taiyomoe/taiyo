import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as mediaBanners from "./schema/mediaBanners";
import * as mediaChapterComments from "./schema/mediaChapterComments";
import * as mediaChapters from "./schema/mediaChapters";
import * as mediaChapterScans from "./schema/mediaChapterScans";
import * as mediaCovers from "./schema/mediaCovers";
import * as medias from "./schema/medias";
import * as mediaTags from "./schema/mediaTags";
import * as mediaTitles from "./schema/mediaTitles";
import * as mediaTrackers from "./schema/mediaTrackers";
import * as roles from "./schema/roles";
import * as scanMembers from "./schema/scanMembers";
import * as scans from "./schema/scans";
import * as tags from "./schema/tags";
import * as trackers from "./schema/trackers";
import * as users from "./schema/users";

neonConfig.fetchConnectionCache = true;

export const schema = {
  ...roles,
  ...users,
  ...tags,
  ...trackers,
  ...medias,
  ...mediaCovers,
  ...mediaBanners,
  ...mediaTags,
  ...mediaTitles,
  ...mediaChapters,
  ...mediaChapterScans,
  ...mediaChapterComments,
  ...mediaTrackers,
  ...scans,
  ...scanMembers,
};

export * from "drizzle-orm";

export const db = drizzle(neon(process.env.DATABASE_URL!), {
  schema,
  logger: true,
});
