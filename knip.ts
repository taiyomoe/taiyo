import type { KnipConfig } from "knip"

const importMatcher = /@import\s+(?:url\(\s*)?["']([^"']+)["']/g
const config: KnipConfig = {
  ignoreWorkspaces: ["./packages/db"],
  ignoreBinaries: ["cloudflared"],
  compilers: {
    css: (text: string) =>
      Array.from(text.matchAll(importMatcher), ([, specifier], index) =>
        /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(specifier)
          ? ""
          : `import _${index} from "${specifier}"`,
      )
        .filter(Boolean)
        .join("\n"),
  },
}

export default config
