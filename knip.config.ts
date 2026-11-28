import type { KnipConfig } from "knip"

/**
 * `@import` in a stylesheet is a real dependency edge, and knip only follows it
 * if something registers a compiler for `.css`. That used to happen for free:
 * the CSS framework's knip plugin registered one, which is why the font
 * packages imported from `packages/ui/src/styles/globals.css` and
 * `apps/web/src/styles.css` never showed up as unused. With the framework gone
 * nothing registers it, so we do — otherwise every CSS-only dependency reads as
 * dead and the report has to be suppressed package by package.
 */
const importMatcher = /@import\s+(?:url\(\s*)?["']([^"']+)["']/g
/**
 * The default run counts tests as users, so code only its tests import never reads as dead.
 * `knip --production` drops tests and every entry without a `!`, then reports what nothing else
 * reaches. Test helpers, dev-server code and local seed data are not production code either:
 * these globs leave them out of that run, and the default run still checks them. An export kept
 * for its tests takes an `@internal` tag, which only the production run honors.
 */
const developmentOnly = (...globs: string[]) => [
  "**/*.{js,mjs,cjs,jsx,ts,tsx,mts,cts}!",
  ...globs.map((glob) => `!${glob}!`),
]
const config: KnipConfig = {
  // Every package is private to the monorepo: an export nothing imports is dead, entry file or not.
  includeEntryExports: true,
  ignoreIssues: {
    // kysely-ctl loads these by convention and calls their exports.
    "packages/db/kysely.config.ts": ["exports"],
    "packages/db/src/{migrations,seeds,fixtures}/*.ts": ["exports"],
    // coss primitives: the kit keeps its whole surface so components can be composed as documented.
    "packages/ui/src/components/ui/*.tsx": ["exports", "types"],
    // knip 6.45's production run drops the react-email preview entries from the graph, so their imports go unseen.
    "packages/emails/src/components/*.tsx": ["exports"],
  },
  workspaces: {
    "apps/api": {
      entry: ["src/backfills/*.ts!"],
      project: developmentOnly("src/__integration-tests__/**"),
    },
    "apps/web": {
      entry: ["scripts/og-media/render.ts!"],
      // twemoji-assets.ts only serves the emoji to the dev server.
      project: developmentOnly("**/__tests__/**", "e2e/**", "twemoji-assets.ts"),
    },
    "packages/db": {
      entry: [
        "kysely.config.ts",
        "src/{seeds,fixtures}/*.ts",
        // The api image migrates before each deploy, and backfills run against production.
        "src/{migrations,backfills}/*.ts!",
        "src/migrate.ts!",
      ],
      project: developmentOnly("src/{seeds,fixtures}/**"),
    },
    "tooling/scripts": {
      entry: [
        "src/{index,bootstrap,check-messages,tunnel}.ts!",
        "src/release/{write-discord-draft,post-discord-announcement}.ts!",
      ],
    },
  },
  ignore: ["apps/web/public/**"],
  // Loaded by oxlint for its type-aware rules.
  ignoreDependencies: ["tsrs"],
  ignoreBinaries: ["cloudflared"],
  compilers: {
    css: (text: string) =>
      Array.from(text.matchAll(importMatcher), ([, specifier], index) =>
        specifier === undefined ||
        specifier === "" ||
        /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(specifier)
          ? ""
          : `import _${index} from "${specifier}"`,
      )
        .filter(Boolean)
        .join("\n"),
  },
}

export default config
