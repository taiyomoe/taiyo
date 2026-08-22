<!-- intent-skills:start -->

## Skill Loading

Before substantial work:

- Skill check: run `npx @tanstack/intent@latest list`, or use skills already listed in context.
- Skill guidance: if one local skill clearly matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` and follow the returned `SKILL.md`.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.

<!-- intent-skills:end -->

# @taiyomoe/web — Project Context

A **blank TanStack Start (React)** app scaffolded with the TanStack CLI and merged
into the `taiyo` pnpm monorepo as a workspace app under `apps/`. No partner
add-ons, no feature scaffolding — intentionally minimal, with room to grow.

## Scaffold provenance

The host repo is an existing pnpm monorepo, not an empty directory, so the CLI was
run in a throwaway scratch directory and its output was merged in here.

- **Exact CLI command (as requested):**
  `npx @tanstack/cli@latest create my-tanstack-app --agent`
  - `--agent` runs non-interactively and auto-wires TanStack Intent. It resolved to
    `@tanstack/cli@0.69.3` and defaulted to `framework: react`, `tailwind: true`,
    `includeExamples: true`, `chosenAddOns: []`, no toolchain (no Biome/ESLint).
- **Re-run for a truly blank app:** the command above defaulted to
  `includeExamples: true`, which emits demo pages + themed `Header`/`Footer`/
  `ThemeToggle` components — i.e. feature scaffolding. To honor the "blank starter,
  no feature scaffolding" requirement, the merged code comes from a re-run with
  `--no-examples` (and `--no-git`, since the repo is already a git repo):
  `npx @tanstack/cli@latest create blank-app --agent --no-examples --no-git`
- **Renamed to `web`:** the CLI commands above used the requested name
  `my-tanstack-app`; the merged app was then renamed to `apps/web` /
  `@taiyomoe/web`.
- **Follow-up TanStack Intent commands (run after scaffolding):**
  - `npx @tanstack/intent@latest install` → wrote the `intent-skills` block at the
    top of this file (resolved to `@tanstack/intent@0.1.1`).
  - `npx @tanstack/intent@latest list` → catalogs the skills shipped by the
    installed TanStack packages.
  - `npx @tanstack/intent@latest load <package>#<skill>` → loads a specific
    `SKILL.md` (e.g. `@tanstack/start-client-core#start-core`). **Load the relevant
    skill before architectural or library-specific changes — don't guess.**
- `.cta.json` records the CLI's choices verbatim for provenance.

## Stack & integrations

- **Framework:** TanStack Start (React) — SSR + file-based routing via TanStack Router.
- **Build:** Vite 8 with the `tanstackStart()` plugin (must precede `viteReact()`).
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` (`@import "tailwindcss"` in `src/styles.css`).
- **Devtools:** `@tanstack/react-devtools` + router devtools panel + `@tanstack/devtools-vite`.
- **Routing:** `src/routes/*` → `src/routeTree.gen.ts` (generated; committed).
- **Toolchain:** kept the CLI default (no Biome/ESLint). Lint/format are handled at
  the workspace root by **oxlint** (`pnpm lint:fix`) and **oxfmt** (`pnpm format:fix`,
  `semi: false`, `sortPackageJson: true`). Tests run from the root via
  `vitest.config.unit.ts` (globs `**/__tests__/**`), so this app defines no local
  test script — matching `apps/api` and `apps/storybook`.

## Environment variables

**None.** The blank starter reads no environment variables (`.cta.json envVarValues`
is empty). The monorepo's shared `.env` (see root `.env.example`) is unrelated to
this app today. If you later add server functions that need secrets, follow the
`apps/api` pattern (`dotenv -e ../../.env --` via a `with-env` script) and register
any new keys in root `turbo.json` `globalEnv`.

## Deployment

No deployment adapter was selected (CLI default). TanStack Start builds via Nitro and
can target Cloudflare / Netlify / Vercel / Node. The monorepo itself uses Cloudflare
(`.wrangler/`), so Cloudflare Workers is the most likely target — but that is **not
configured here yet**. To add one: `load @tanstack/start-client-core#start-core/deployment`
and configure the Nitro preset. Default `vite build` + `vite preview` works locally.

## Key architectural decisions

1. **Monorepo merge, not a standalone repo.** Placed at `apps/web`, package name
   `@taiyomoe/web` (matches `@taiyomoe/api`, `@taiyomoe/storybook`). The standalone
   npm `package-lock.json` and the scratch `.git` were dropped; dependencies are
   managed by the root pnpm workspace. The CLI's standalone `.gitignore` and
   `README.md` were also dropped — build-artifact ignores live in the **root**
   `.gitignore` (`.tanstack`, `.nitro`, `.output`, `.vinxi`, `*.local`), and the app
   is documented in the **root** `README.md`.
2. **`tsconfig.json` extends `@taiyomoe/typescript/base.json`** (the shared base)
   instead of the CLI's standalone config, then layers on what Start needs: `jsx:
react-jsx`, DOM libs, `vite/client` types, and a single `@/*` path alias. The CLI
   also shipped a `#/*` alias (and a matching `package.json#imports` entry); both
   were removed in favor of `@/*` only.
3. **`verbatimModuleSyntax` forced to `false`.** The CLI's generated tsconfig set it
   to `true`, but the shipped `@tanstack/start-client-core#start-core` skill flags
   that as a HIGH-severity mistake ("causes server bundles to leak into client
   bundles. Keep it disabled"). Per the skill, it is disabled here. Revisit if a
   future CLI/skill version changes this guidance.
4. **Versions pinned & aligned with the workspace.** The CLI emitted several deps as
   `latest`; these were pinned to the resolved versions and aligned with the
   versions already used by `apps/storybook` / root (react 19.2.7, vite 8.0.16,
   typescript 6.0.3, @tailwindcss/vite 4.3.0, etc.) so the `postinstall` **sherif**
   workspace check passes.

## Deviations from raw CLI output (and why)

- **Dropped unused deps** to satisfy the monorepo's `knip`/`sherif` tooling — none
  are imported by the blank starter: `lucide-react` (icons), `@tailwindcss/typography`
  (prose), `@tanstack/react-router-ssr-query` (TanStack Query↔Router SSR; no
  QueryClient here), and the test stack (`vitest`, `@testing-library/*`, `jsdom`)
  plus the `test` script (root owns testing).
- **Dropped the app-level `pnpm.onlyBuiltDependencies` field** — build-script
  approvals are governed by the root `pnpm-workspace.yaml` `allowBuilds` in a workspace.

## Known gotchas

- **Vite plugin order matters:** `tanstackStart()` must come _before_ `viteReact()`
  in `vite.config.ts`, or route generation / server-function compilation breaks.
- **`routeTree.gen.ts` is generated.** Don't hand-edit it; it's marked read-only in
  `.vscode/settings.json`. It regenerates on dev/build or via `generate-routes`.
- **Turbo build outputs:** the default `vite build` emits to `dist/client` +
  `dist/server`, already covered by root `turbo.json`'s `dist/**` cache output. If
  you later add a Nitro deployment preset that emits `.output/**` / `.nitro/**`
  (already git-ignored via the root `.gitignore`), add those globs to the root
  `build` task outputs too.
- **Port 3000** is hardcoded in the `dev` script; currently free in this repo
  (api is separate, storybook uses 6006).

## Next steps

- `pnpm install` at the root, then `pnpm --filter @taiyomoe/web dev`.
- Add routes under `src/routes/`; load `@tanstack/router-core#router-core` skills as needed.
- Decide on a deployment adapter (likely Cloudflare, to match the rest of the repo).
- If tests are wanted, add a `__tests__/` dir (picked up by the root vitest config).
