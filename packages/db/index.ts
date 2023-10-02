import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as mediaBanners from "./schema/mediaBanners";
import * as mediaChapters from "./schema/mediaChapters";
import * as mediaCovers from "./schema/mediaCovers";
import * as medias from "./schema/medias";
import * as mediaTags from "./schema/mediaTags";
import * as mediaTitles from "./schema/mediaTitles";
import * as mediaTrackers from "./schema/mediaTrackers";
import * as roles from "./schema/roles";
import * as scanMembers from "./schema/scanMembers";
import * as scans from "./schema/scans";
import * as users from "./schema/users";

neonConfig.fetchConnectionCache = true;

export const schema = {
  ...users,
  ...roles,
  ...medias,
  ...mediaCovers,
  ...mediaBanners,
  ...mediaTags,
  ...mediaTitles,
  ...mediaChapters,
  ...mediaTrackers,
  ...scans,
  ...scanMembers,
};

export * from "drizzle-orm";

export * from "./types/media.types";
export * from "./types/mediaChapter.types";

export const db = drizzle(neon(process.env.DATABASE_URL!), { schema });
