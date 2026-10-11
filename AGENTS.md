# Taiyō

## Dev environment

Run `pnpm bootstrap`, then `pnpm dev`. Use `pnpm dev:tunnel` when someone needs public URLs. Bootstrap is idempotent, so rerun it whenever the environment looks out of sync: after pulling new migrations, after editing the root `.env`, or when a service is unreachable.

- The root `.env` is the single source of truth for ports and credentials. Bootstrap writes the infrastructure values in `apps/*/.env` from it, so change them there and rerun.
- Each worktree claims its own port slot, so its URLs differ from the README defaults. Read them from the root `.env` (`WEB_PORT`, `API_PORT`) or from bootstrap's closing summary.
- `docker-compose.yml` publishes every port on `127.0.0.1`; publish new services the same way.
