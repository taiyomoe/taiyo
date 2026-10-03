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
const config: KnipConfig = {
  ignoreWorkspaces: ["./packages/db"],
  compilers: {
    css: (text: string) =>
      Array.from(text.matchAll(importMatcher), ([, specifier], index) =>
        // Skip anything with a URL scheme or a protocol-relative host: those
        // are fetched at runtime, not resolved from node_modules.
        /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(specifier)
          ? ""
          : `import _${index} from "${specifier}"`,
      )
        .filter(Boolean)
        .join("\n"),
  },
}

export default config
