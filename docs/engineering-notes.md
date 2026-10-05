# Engineering notes

Backend and infrastructure rationale that does not belong in a source comment.

## Continuous integration

### Why three workflows

CI used to be a single `ci.yml` with five jobs: `knip`, `format` and `lint` in
parallel, then `unit-tests` and `integration-tests` gated behind all three via
`needs`. That shape paid the setup cost — `pnpm/action-setup`, `setup-node`,
`pnpm add -g turbo`, a full `pnpm install`, a paraglide compile and a
`pnpm dlx sherif@latest` fetch — five times per push, and it serialised the two
test suites behind the slowest static check even though no test depends on a
lint result.

The replacement is three workflow files, one job each:

| File                 | Job                 | Checks                                  |
| -------------------- | ------------------- | --------------------------------------- |
| `ci-static.yml`      | `static-analysis`   | `lint`, `format`, `lint:ws`, `knip`     |
| `ci-unit.yml`        | `unit-tests`        | `test:unit`                             |
| `ci-integration.yml` | `integration-tests` | `test:integration` + service containers |

Setup now runs three times instead of five, and wall-clock time is the slowest
of the three rather than `max(static) + max(tests)`. Separate files also mean
separate `concurrency` groups (`github.workflow` is part of the key), so a new
push cancels each workflow's own in-flight run without the groups colliding.

The four static checks are one job on purpose: each takes seconds, so splitting
them would cost more in setup than it saves in parallelism. They all carry
`if: ${{ !cancelled() }}` so a lint failure still reports the format, sherif and
knip results in the same run — one push, the full list of what is wrong.

`cancel-in-progress` is deliberately `${{ github.ref != 'refs/heads/main' }}`:
branch and PR runs are disposable, `main`'s history is not. The `merge_group`
trigger is retained against a merge queue being enabled later; with no branch
protection configured it currently never fires.

### Why the setup action lives in `.github/actions/setup`

It used to be `tooling/github/setup`, which made it a pnpm workspace package
(`@taiyomoe/github`) that existed solely to hold a YAML file — it shipped no
code, no types and no dependencies. Composite actions are GitHub configuration,
so they live with the rest of it. The workspace package is gone.

Three steps were dropped from the action:

- **`pnpm add -g turbo`.** `turbo` is a root devDependency and every CI step
  invokes pnpm scripts directly. Nothing in CI resolved the global copy, so it
  was a network round-trip per job for nothing. If a build gate is added later it
  should use the local binary and wire up `TURBO_TOKEN` / `TURBO_TEAM` for
  remote caching.
- **The explicit `Compile Paraglide messages` step.** The root `postinstall`
  already compiles it (see below), so the action compiled it a second time in
  every job.
- **`pnpm lint:ws` inside the root `postinstall`.** sherif ran on every install
  — once per CI job, and once per local `pnpm install` — via
  `pnpm dlx sherif@latest`, which fetches the package each time and resolves
  whatever version happened to be latest that minute. It is now an explicit step
  in `ci-static.yml`, so workspace-dependency drift reports as its own failed
  check instead of being buried in an install log, and sherif itself is a pinned
  root devDependency (`lint:ws` is plain `sherif`) so it comes out of the pnpm
  store cache with no fetch and no chance of a new release turning CI red on an
  unrelated push. Renovate bumps it like any other tool.

`pnpm install` keeps its root `postinstall`, which is load-bearing in CI: the
paraglide output under `apps/web/src/paraglide` is generated and self-ignored, so
it is never committed, and both `lint` and `knip` resolve `@/paraglide/messages`.
Neither job builds, so the postinstall compile is what gives every job — and
every fresh clone — a complete tree. Install is `--frozen-lockfile` so a stale
`pnpm-lock.yaml` fails loudly rather than being silently patched.

### paths-ignore

All three workflows skip `**.md`, `docs/**`, `plans/**`,
`.github/ISSUE_TEMPLATE/**` and `LICENSE`. None of those are inputs to lint,
format, knip or either test suite.

This is safe only because the repo has no branch protection and no rulesets: a
workflow skipped by `paths-ignore` reports no status at all, so if these are ever
made **required** status checks, every doc-only PR will sit forever on a pending
check. The fix at that point is a `paths-filter` job that always runs and
reports success, not removing `paths-ignore`.

### Timeouts and measured baselines

`ci-static` and `ci-unit` cap at 10 minutes, `ci-integration` at 20. The default
is 6 hours, which turns one hung service container into a wasted runner-hour
budget.

First green run on `ubuntu-latest`, cold pnpm store cache:

| Workflow         | Duration |
| ---------------- | -------- |
| `ci-unit`        | 0m39s    |
| `ci-static`      | 0m46s    |
| `ci-integration` | 3m32s    |

Wall clock is therefore ~3m30s, the slowest of the three, against roughly
4m20s plus two extra setups under the old `needs`-gated shape.

Integration is the one to watch: it gives each of its ~72 files a freshly cloned
Postgres database, a new S3 bucket and a full `initMediasIndex` reindex, and a
2-vCPU runner has little parallelism to absorb that. 3m32s leaves ~5x headroom
under the cap, so the cap is there to catch a hang, not to bound normal growth.
If it ever starts brushing it, the next lever is sharding (`--shard=i/n` across a
matrix), accepting n x the service-container and install cost in exchange for
roughly 1/n the wall clock.

### Job names

Both test workflows run a job called `Vitest`, so they are named
`Vitest (unit)` and `Vitest (integration)`. The workflow name disambiguates them
in the PR checks UI, but the bare job name is what the checks API and
`gh pr checks` report, and what a required-status-check rule would match — two
entries called `Vitest` would be ambiguous there.
