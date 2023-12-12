import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Checks if the app is running in development mode.
 * If `NODE_ENV` is not set, it defaults to development.
 */
const isDev = process.env.NODE_ENV
  ? process.env.NODE_ENV === "development"
  : true;

/**
 * Makes a schema optional if not in development mode.
 *
 * @param {z.ZodSchema} schema
 * @returns
 */
const onlyDev = (schema) => {
  return isDev ? schema : schema.optional();
};

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // Database
    DATABASE_URL: z.string().url(),
    DATABASE_USERNAME: onlyDev(z.string()),
    DATABASE_PASSWORD: onlyDev(z.string()),
    DATABASE_NAME: onlyDev(z.string()),
    DATABASE_PORT: onlyDev(z.string()),

    // Authentication
    NEXTAUTH_SECRET: z.string(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url(),
    ),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),

    // image-orchestrator API
    IO_ADMIN_KEY: z.string(),

    // Encryption
    ENCRYPTION_KEY: z.string(),
    ENCRYPTION_IV: z.string(),

    // Meilisearch
    MEILISEARCH_MASTER_KEY: onlyDev(z.string()),
    MEILISEARCH_ADMIN_KEY: z.string(),

    // Soketi
    SOKETI_APP_ID: z.string(),
    SOKETI_APP_SECRET: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // CDN
    NEXT_PUBLIC_CDN_URL: z.string().url(),

    // image-orchestrator API
    NEXT_PUBLIC_IO_URL: z.string().url(),

    // Meilisearch
    NEXT_PUBLIC_MEILISEARCH_URL: z.string().url(),
    NEXT_PUBLIC_MEILISEARCH_PUBLIC_KEY: z.string(),

    // Soketi
    NEXT_PUBLIC_SOKETI_HOST: z.string(),
    NEXT_PUBLIC_SOKETI_PORT: z.coerce.number(),
    NEXT_PUBLIC_SOKETI_APP_KEY: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    // Database
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_USERNAME: process.env.DATABASE_USERNAME,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    DATABASE_NAME: process.env.DATABASE_NAME,
    DATABASE_PORT: process.env.DATABASE_PORT,

    // Authentication
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,

    // Encryption
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    ENCRYPTION_IV: process.env.ENCRYPTION_IV,

    // CDN
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,

    // image-orchestrator API
    IO_ADMIN_KEY: process.env.IO_ADMIN_KEY,
    NEXT_PUBLIC_IO_URL: process.env.NEXT_PUBLIC_IO_URL,

    // Meilisearch
    MEILISEARCH_MASTER_KEY: process.env.MEILISEARCH_MASTER_KEY,
    MEILISEARCH_ADMIN_KEY: process.env.MEILISEARCH_ADMIN_KEY,
    NEXT_PUBLIC_MEILISEARCH_URL: process.env.NEXT_PUBLIC_MEILISEARCH_URL,
    NEXT_PUBLIC_MEILISEARCH_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_MEILISEARCH_PUBLIC_KEY,

    // Soketi
    SOKETI_APP_ID: process.env.SOKETI_APP_ID,
    SOKETI_APP_SECRET: process.env.SOKETI_APP_SECRET,
    NEXT_PUBLIC_SOKETI_HOST: process.env.NEXT_PUBLIC_SOKETI_HOST,
    NEXT_PUBLIC_SOKETI_PORT: process.env.NEXT_PUBLIC_SOKETI_PORT,
    NEXT_PUBLIC_SOKETI_APP_KEY: process.env.NEXT_PUBLIC_SOKETI_APP_KEY,
  },

  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
