# Authoring components with StyleX (packages/ui)

Every component in `src/components/ui` is styled in StyleX and nothing else —
there is no utility-class framework anywhere in the monorepo. `button.tsx`,
`separator.tsx` and `skeleton.tsx` are the reference files; read them before
writing a new component.

## Non-negotiable conventions

1. **`sx` prop** (`sx?: Sx`, imported from `../../styles/sx`) is the StyleX
   channel for callers. It is always the LAST argument to `stylex.props()` so
   caller overrides win. `className` stays as a plain DOM pass-through —
   nothing in this package styles through it, but third-party libraries hand
   components a class name to render (react-day-picker's `classNames` map, for
   one) and tests target them: `className={cn(styleProps.className, className)}`.
   `style` stays React's inline-style prop: `style={{ ...styleProps.style, ...style }}`
   when the component accepts `style`, else `style={styleProps.style}`.
2. **`sx` on a host element is a compiler feature; on a component it is just a
   prop.** `sxPropName` (default `"sx"`) makes the compiler rewrite
   `<div sx={styles.x} />` into `<div {...stylex.props(styles.x)} />` — but
   only for LOWERCASE JSX names. On a component, `sx` is an ordinary prop that
   works if and only if that component plumbs it into its own
   `stylex.props()`. Every component in this package does. A third-party one
   (`HugeiconsIcon`, a lucide icon) does NOT: pass it `{...stylex.props(…)}`
   instead.

   **A file using `sx` on a host element MUST import `@stylexjs/stylex`**, even
   if nothing in it calls `stylex.*`. The bundler plugin only processes files
   that import StyleX; without the import the file is skipped whole, `sx` stays
   a meaningless DOM attribute, and every style in it silently stops applying.
   `oxlint` will report that import as unused — keep it, with an
   `oxlint-disable-next-line no-unused-vars` and a note saying why.

   TypeScript will not catch either mistake. `src/styles/sx.ts` augments React's
   `DOMAttributes` so `sx` type-checks on host elements, and that augmentation
   is inherited by any component whose props extend `HTMLAttributes` or
   `SVGAttributes` — which is most of them. `sx` on a third-party icon
   type-checks and silently does nothing. The symptom is a style that simply
   never applies; check the rendered DOM for the atom class before assuming
   the style itself is wrong.

3. **Tokens only.** Colors, radii, shadows, fonts come from
   `../../styles/tokens.stylex` — a relative import, because the StyleX
   compiler cannot resolve tsconfig aliases for token files (`colors`, `radius`,
   `shadows`, `spacing`, `text`, `font`, `consts`). Never hardcode a color. A
   component must never know which theme is live: if light and dark need
   different values, add a semantic token pair (light value in `colors`/
   `shadows`, dark value in `darkTheme`/`darkShadows`) instead of branching.
   Existing semantic tokens: `chip` (raised chip surface), `chipHover`, `field`
   (input surface), `well` (sunken panel), and shadows `raised`, `overlay`,
   `sunken`, `edge` (1px surface edge for ::before), `emboss`, `pressed`.
4. **Concentric radii.** An element inside a rounded, padded container takes
   `calc(<container radius> - <container padding>)`, never a fixed step from
   the scale. A `radius.sm` row inside a `radius.xl` popup reads as a square
   corner fighting a round one — this is the single most common way the system
   looks cheap. It applies to popup/menu/select/combobox/command rows, frame
   panels, and anything else nested in a padded surface.
5. **A chip is one object.** Multi-part chips (a keyboard chord, a segmented
   value) get ONE surface on the container, with the parts inside rendered as
   plain content. Giving each part its own box produces rows of clashing
   borders — see `kbd.tsx` and its `KbdSurface` context.
6. **Design language** (do not regress it):
   - raised surfaces: `boxShadow: shadows.raised` (cards) / `shadows.overlay`
     (popups) + a `::before` overlay layer with `boxShadow: shadows.edge`.
   - sunken rails/tracks (slider rail, progress/meter track, unchecked switch,
     tabs list): `backgroundColor: colors.well` + `boxShadow: shadows.sunken`.
   - pills: buttons/badges/tabs use `borderRadius: radius.full`; fields, menus
     and popovers use `radius.xl`; cards/dialogs `radius.xxl`.

## Proportions, measured off the reference

These are not taste calls — they were measured pixel-wise on the reference
mockup (`apps/storybook` field at 2048px wide; field height 79px, cap height
20px so font-size ≈ 27.5px). Express them as ratios to the control's font size
and they survive any rescale:

| Ratio                              | Value                               | Was  |
| ---------------------------------- | ----------------------------------- | ---- |
| field height / font-size           | **2.87**                            | 2.29 |
| leading glyph / font-size          | **0.87**                            | 1.14 |
| keycap chip height / font-size     | **1.53**                            | 1.43 |
| keycap corner radius / chip height | **0.35** (rounded rect, NOT a pill) | 0.51 |

Surface steps, in sRGB luminance: page → field ≈ +14, field → keycap fill
≈ +22, keycap fill → keycap border ≈ +28. The keycap's lighter hairline border
is what makes it read as a physical key rather than a flat tint; that is what
`colors.keycap` / `colors.keycapBorder` encode.

**Method**: serve the reference image over `python3 -m http.server`, load it
into a canvas in headless Chrome, and scan luminance rows/columns for edges.
Do that before changing a proportion — eyeballing a JPEG at 25% zoom produced
two rounds of wrong guesses.

## Calibrating light against dark

Dark is the reference the user picked, so light is derived from it, not
designed separately. The two themes have to _behave_ the same, which is not the
same as looking the same:

- **Elevation always moves toward the light source.** Dark stacks up from a
  near-black page (bg 12 -> well 25 -> field 27 -> card 30 -> popover 32 ->
  keycap 49, 8-bit grey); light stacks up toward white (page 236 -> well 231 ->
  field 250 -> card 253 -> popover 255, keycap white). The light page therefore
  CANNOT be near-white: without headroom below white, a white card has nothing
  to rise above. That is why `background` is a soft grey, not neutral100.
- **What carries the separation flips.** A keycap in dark is a lighter fill
  with a lighter hairline; in light it is a white fill with a DARKER hairline,
  because white has no headroom left. Same for the switch thumb: in dark it
  separates by lightness alone, in light `shadows.thumb` is the only thing
  holding it off the track.
- **Surface tokens stay opaque in both themes.** A black-alpha token looks
  different depending on what it sits on — `well` as `rgb(0 0 0 / 8%)` was
  nearly invisible on a white popover and heavy on the page, while dark's
  `well` is a fixed colour everywhere. Alpha is fine for `muted`/`accent`/
  `border` (deliberately surface-relative); it is wrong for anything that is a
  step in the elevation stack.
- **Foreground greys are matched by contrast ratio, not palette step.** The
  dark muted grey is 5.8:1 against its own background; light's
  `oklch(47.7% 0 0)` was chosen to hit the same ratio against the light page.

## What StyleX 0.19 + this repo's lint allow

- Conditions go **inside property values**:
  `color: { default: x, ":hover": y, "[data-checked]": z }`.
  Style-level `:hover`/`@media` blocks are lint-banned (`no-legacy-contextual-styles`).
- Allowed pseudo-classes (lint allowlist, exact strings): `:first-child`,
  `:last-child`, `:only-child`, `:nth-child`, `:nth-of-type`, `:empty`,
  `:hover`, `:focus`, `:focus-visible`, `:focus-within`, `:active`, `:visited`,
  `:disabled`, plus `@media …`, `@container …`, `@supports …`,
  `@starting-style`.
- **Attribute selectors work and pass lint** (value-level only):
  `"[data-checked]"`, `"[data-disabled]"`, `"[aria-invalid]"`,
  `"[data-popup-open]"`, `'[data-orientation="vertical"]'`… This is how Base UI
  state gets styled. They have no specificity priority (all equal), so when two
  could match at once, later source order wins — order them accordingly. When
  an attribute condition would have to beat a pseudo-class on the same
  property, don't rely on ordering: split the winner into its own style and
  pass it as a later argument to `stylex.props()`.
- **Banned by lint** (do not use): `:has()`, `:not()`, `:is()`, `:checked`,
  `:nth-child(2n)` (parameterized), `stylex.when.descendant`,
  `stylex.when.siblingAfter`, `stylex.when.anySibling`.
- Allowed contextual: `stylex.when.ancestor(selector, marker)` and
  `stylex.when.siblingBefore(...)` with `stylex.defineMarker()` /
  `stylex.defaultMarker()` spread on the ancestor. Use it to let one of OUR
  components react to another's state (e.g. drawer nesting).
- Pseudo-elements (`"::before"`, `"::after"`, `"::placeholder"`) are namespace-
  level keys inside a style object.
- Breakpoints: `consts.sm` / `consts.pointerCoarse` / `consts.pointerFine` from
  tokens — use computed keys: `height: { default: "2.25rem", [consts.sm]: "2rem" }`.
  Anything outside that set is an inline media-query string:
  `{ default: "1fr", "@media (width >= 54rem)": "1.4fr repeat(3, 1fr)" }`.
- **`stylex.when.*` keys are only legal at the FIRST level of a condition
  object.** `color: { default: x, [stylex.when.ancestor(":active", m)]: y }` is
  fine; nesting one level deeper (a media query under the `when` key, or a
  `when` key under `default`) fails `valid-styles` with "Keys must be strings".
  When a `when`-driven property also needs a breakpoint, hoist the breakpoint
  into a CSS custom property on the ancestor (`"--thumb-size": { default: …,
[consts.sm]: … }`) and have the descendant read `var(--thumb-size)`.
  `consts.*` keys are exempt and work at any depth.
- **`stylex.createTheme()` is all-or-nothing, even with a partial override.**
  The types accept `createTheme(colors, { ring: gold })`, but the class it
  produces re-declares the WHOLE group: applying it resets every other colour
  on that subtree to the group's defaults (i.e. the light theme), silently
  undoing `darkTheme` from `<html>`. Use it only for a complete theme. To
  re-point one value for a subtree, set the plain CSS custom property that
  consumes it (`"--ring": scene.gold` in a `stylex.create`) instead.
- **`stylex.defineMarker()` only compiles inside a `*.stylex.ts` file, bound
  to a named export.** In a component file it fails the build with "must be
  bound to a named export" or "Unable to generate hash for defineMarker()" —
  neither of which `oxlint` or `tsc` catch. All markers live in
  `src/styles/markers.stylex.ts`.
- A given `stylex.when.*` key may appear only ONCE per property. Writing it in
  two branches of a nested value object fails the build with "The same pseudo
  selector or at-rule cannot be used more than once".
- Grid line numbers must be strings: `gridColumnStart: "2"`, not `2`. So must
  `flex`: `flex: "1"`, not `1`.
- **`animationName` only accepts a `stylex.keyframes()` handle.** To drive an
  element from a global `@keyframes` (the brand-scene animations in
  `apps/web/src/styles.css`), set `animation` through the inline `style` prop
  and merge it with `stylex.props(...).style`.
- The `sx` prop is typed `Sx` (from `../../styles/sx`), NOT
  `stylex.StyleXStyles` — the latter rejects any style whose pseudo-element
  layer carries conditions. See that file for the reasoning.
- **Icon sizing is an explicit allowlist in `structural.css`.** An icon
  component with no size rule falls back to its intrinsic 24px, which overflows
  every control we build. When you add a component that accepts consumer icon
  children, add its `data-slot` to the two `svg` blocks at the top of that file
  (`flex-shrink`/`pointer-events`, then the `height`/`width` pair). Audit for
  misses by walking every story and flagging any `svg` that renders at exactly
  24px — that number never appears on purpose.
- **`default: null` in a MODIFIER style silently erases the base style's
  value.** `stylex.props(styles.base, styles.modifier)` merges per property, so
  a modifier that declares `height: { default: null, "[x]": "2px" }` overrides
  `base`'s height with nothing whenever `[x]` does not match. `null` means "no
  declaration for this branch", not "inherit what came before". It is fine in a
  base style (the property simply goes unset); in a modifier the default must
  REPEAT the base's value. This has caused three separate silent bugs: table
  rows with no separator, toasts with `transform: none` stacked on top of each
  other, and a 0px-wide tab underline. Detect them by listing, for every
  `stylex.props()` call, the properties a later argument nulls that an earlier
  one sets.
- **The cascade is three declared layers, identical in both apps.** Each app's
  `stylex.vite()` names them with `useCSSLayers: { before: ["base",
"structural"] }`, which emits `@layer base, structural, priority1, …`:
  - `base` — `reset.css` and the document defaults in `globals.css`. It has to
    lose to everything: an unlayered `* { margin: 0; padding: 0 }` would
    outrank every padding a component declares and the system would render as
    unstyled boxes.
  - `structural` — `structural.css`. It may freely ADD a declaration StyleX
    does not set (the normal case) and needs `!important` to override one.
    Forgetting that is silent: the rule matches, `querySelectorAll` finds the
    element, and the computed value is still StyleX's.
  - `stylex.priority*` — every component's own styles, which win by default.

  Anything left unlayered (an app's own `styles.css`) beats all three, which is
  why `apps/web`'s `[data-auth-fields]` block can reach into @taiyomoe/ui.
  Don't change the `before` list without re-checking both apps visually — it
  decides which of two colliding declarations you actually see.

- **Two StyleX styles merged as separate className STRINGS do not respect
  source order.** `stylex.props(a, b)` resolves conflicts so `b` wins, but when
  a third party concatenates the two class strings (react-day-picker's
  `classNames` map, for instance) StyleX's resolution never runs and plain CSS
  order decides. Longhands still beat shorthands, so `borderStartStartRadius`
  overrides `borderRadius`, but shorthand-vs-shorthand is a coin flip. Put the
  conflicting declaration in `structural.css` with `!important` instead.
- `oxlint` enforces `@stylexjs/sort-keys` (a CSS-priority order, NOT
  alphabetical). Don't hand-sort: write the styles, then run
  `pnpm lint:fix` from the repo root REPEATEDLY until the error count stops
  shrinking (the fixer moves one key per pass), then `pnpm format:fix`.

## Recipes

- **Focus rings: use `outline`, not a box-shadow ring** — a ring would compose
  with the elevation shadows and muddy them.
  - buttons/toggles: `outline: { default: "none", ":focus-visible": "2px solid <ring>" }`, `outlineOffset: 1`.
  - fields: `outline: { default: "none", ":focus-within": "3px solid color-mix(in srgb, <ring> 24%, transparent)" }`
    plus `borderColor: { ..., ":focus-within": colors.ring }`. Invalid fields
    swap the ring color for destructive at 16–24%.
- **Coarse-pointer tap targets**: an `"::after"` namespace with
  `content: { default: "none", [consts.pointerCoarse]: '""' }` plus the
  geometry (`position: "absolute"`, `minHeight: "2.75rem"`, …).
- **A wrapper that must react to the control inside it**: `:has()` is banned,
  so put a `data-disabled`/`aria-invalid` attribute on the wrapper element in
  JSX (the component already knows the state from its props) and match
  `"[data-disabled]"`.
- **Tinted colours**: `color-mix(in srgb, ${colors.primary} 90%, transparent)` —
  a template string, since token interpolation is supported.
- **The `::before` edge overlay**: a `"::before"` namespace with
  `borderRadius: "inherit"`, `inset: 0`, `boxShadow: shadows.edge`,
  `content: '""'`, `pointerEvents: "none"`, `position: "absolute"`.
- **Descendant styling of ARBITRARY children** (a consumer's icon, a slot we do
  not render): move the rule to `src/styles/structural.css`, scoped under
  `[data-slot="…"]`, using plain CSS and the `--taiyo-*` hooks documented
  there. Add a `data-size`/`data-variant` attribute to the component root when
  the rule varies. Keep structural.css MINIMAL — anything expressible on the
  element itself belongs in StyleX, and styling of children the component
  itself renders is done in StyleX directly on that child.
- **State that every part needs** (a `size` on a compound component, a
  `variant` on a table): publish it through React context and let each part
  style itself. StyleX has no ancestor selector that reaches arbitrary depth.
- **Variant maps**: a plain `styles`/`variantStyles` object +
  `stylex.props(styles.base, variantStyles[variant], sizeStyles[size], …, sx)`.
  `buttonVariants()` is the one exception: it returns a class string, for the
  handful of places that style a foreign element as a button.
- **Animations**: `stylex.keyframes` (see `skeleton.tsx`). Transitions: plain
  `transitionProperty`/`transitionDuration`/`transitionTimingFunction`.
- **CSS custom properties from Base UI** (`var(--anchor-width)`,
  `var(--available-height)`, `--thumb-size`) are plain strings in values:
  `minWidth: "var(--anchor-width)"`.

## Verification for every file you touch

`oxlint` and `tsc` do NOT see StyleX compile errors — the compiler only runs
in the bundler. A file can pass both and still fail to build. Always finish
with the Storybook check.

1. `pnpm lint` and `pnpm exec tsc --noEmit` (run inside `packages/ui`) pass.
2. The component's story renders in Storybook (already wired with the StyleX
   compiler): `curl -sf "http://localhost:6006/iframe.html?id=<story-id>"`
   returns HTML, and no `Unexpected 'stylex.create' call` appears in the
   Storybook terminal log. `pnpm build` in `apps/storybook` is the thorough
   version.
3. The component looks right in BOTH themes — the design language above, not
   just "it renders".
