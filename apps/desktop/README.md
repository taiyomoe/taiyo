# Taiyō desktop (experiment)

The web app's sign-in and home pages, rebuilt natively with [GPUI](https://gpui.rs). macOS only.

## Run

Start the API (`pnpm dev` at the repo root), then:

```sh
cargo run --release
```

The app opens on the sign-in page and keeps the session in `~/Library/Application Support/taiyo-desktop/state.json`; `--sign-out` forgets it. Any seeded dev account works (`<username>@gmail.com` / `password123`).

| Variable              | Default                 |                                                   |
| --------------------- | ----------------------- | ------------------------------------------------- |
| `TAIYO_API_URL`       | `http://localhost:3062` | The API                                           |
| `TAIYO_WEB_URL`       | `http://localhost:3060` | The origin better-auth trusts for sign-in         |
| `TAIYO_SESSION_TOKEN` |                         | Open signed in with this session token            |
| `TAIYO_CPU_SUN`       |                         | Render the plasma sun on the CPU instead of Metal |

## How the web's effects are reproduced

- **Plasma sun**: the three.js GLSL shaders, translated to a Metal compute kernel (`src/sun_gpu.rs`); a CPU port in `src/sun.rs` is the fallback.
- **Gradients**: GPUI quads take two stops; `src/paint.rs` slices any CSS `linear-gradient()` into bands over arbitrary shapes.
- **Radial gradients, `filter: blur()`, cover art**: rendered to images off the UI thread (`src/raster.rs`, `src/images.rs`).
- **Letter spacing, line clamp with ellipsis, `text-wrap: balance`**: `src/text.rs` and `balanced_width` in `src/auth.rs`.
- **Skeleton shimmer**: one band over the whole viewport, as `background-attachment: fixed` draws it (`src/skeleton.rs`).

GPUI has no `backdrop-filter`, so the navbar shows the content under it unblurred.

## Debug captures

`--features snapshot` adds `TAIYO_SNAPSHOT=<dir>`, which writes PNGs of the window (`TAIYO_SNAPSHOT_DELAY`, `_EVERY`, `_COUNT` in ms / frames), and `TAIYO_TRACE_FRAMES` for draw times. It draws frames itself, so it works with the screen locked, and needs a GPUI whose `Window::present` is public: patch a local copy in with `--config 'patch.crates-io.gpui.path="…"'`. `TAIYO_DEMO=action@ms,…` scripts interactions (`login`, `signup`, `grid`, `compact`, `list`, `next`, `sidebar`, `tooltip`, `scroll`) and `TAIYO_SLOW_API=ms` holds requests to show the loading states.
