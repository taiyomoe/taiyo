import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as mediaChapters from "./schema/mediaChapters";
import * as medias from "./schema/medias";
import * as mediaTags from "./schema/mediaTags";
import * as mediaTitles from "./schema/mediaTitles";
import * as scanMembers from "./schema/scanMembers";
import * as scans from "./schema/scans";
import * as users from "./schema/users";

neonConfig.fetchConnectionCache = true;

export const schema = {
  ...users,
  ...medias,
  ...mediaTags,
  ...mediaTitles,
  ...mediaChapters,
  ...scans,
  ...scanMembers,
};

export * from "drizzle-orm";

export const db = drizzle(neon(process.env.DRIZZLE_DATABASE_URL!), { schema });
