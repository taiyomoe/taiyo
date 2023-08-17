import { Client } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import * as auth from "./schema/auth";
import * as medias from "./schema/medias";
import * as mediaTags from "./schema/mediaTags";
import * as mediaTitles from "./schema/mediaTitles";
import * as scanMembers from "./schema/scanMembers";
import * as scans from "./schema/scans";

export const schema = {
  ...auth,
  ...medias,
  ...mediaTags,
  ...mediaTitles,
  ...scans,
  ...scanMembers,
};

export * from "drizzle-orm";

export const db = drizzle(
  new Client({
    url: process.env.DATABASE_URL,
  }).connection(),
  { schema },
);
