# Tailwind → StyleX conversion guide (packages/ui)

Every component in `src/components/ui` is being rewritten from Tailwind class
strings to StyleX. `button.tsx`, `separator.tsx` and `skeleton.tsx` are the
reference conversions — read them before converting anything.

## Non-negotiable conventions

1. **Component API is preserved.** Same exports, same props, same `data-slot`
   attributes, same DOM structure, same Base UI primitives. Consumers must not
   need changes (exception: `*Variants` cva exports become plain functions that
   return a className string — keep the export name).
2. **`sx` prop** (`sx?: Sx`, imported from `../../styles/sx`) is the StyleX channel for callers.
   It is always the LAST argument to `stylex.props()` so caller overrides win.
   `className` stays as a legacy Tailwind shim: `className={cn(styleProps.className, className)}`.
   `style` stays React's inline-style prop: `style={{ ...styleProps.style, ...style }}`
   when the component previously accepted `style`, else `style={styleProps.style}`.
3. **Tokens only.** Colors, radii, shadows, fonts come from
   `../../styles/tokens.stylex` (relative import — the StyleX compiler cannot resolve tsconfig aliases for token files) (`colors`, `radius`, `shadows`, `spacing`, `text`,
   `font`, `consts`). Never hardcode a color. If the Tailwind source used a
   `dark:` variant that is not just a token swap, add a semantic token pair to
   `tokens.stylex.ts` (light value in `colors`/`shadows`, dark value in
   `darkTheme`/`darkShadows`) instead — components must never know about themes.
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
  could match at once, later source order wins — order them accordingly.
- **Banned by lint** (do not use): `:has()`, `:not()`, `:is()`, `:checked`,
  `:nth-child(2n)` (parameterized), `stylex.when.descendant`,
  `stylex.when.siblingAfter`, `stylex.when.anySibling`.
- Allowed contextual: `stylex.when.ancestor(selector, marker)` and
  `stylex.when.siblingBefore(...)` with `stylex.defineMarker()` /
  `stylex.defaultMarker()` spread on the ancestor. Use for `group-*` patterns
  between OUR components (e.g. drawer nesting).
- Pseudo-elements (`"::before"`, `"::after"`, `"::placeholder"`) are namespace-
  level keys inside a style object.
- Breakpoints: `consts.sm` / `consts.pointerCoarse` / `consts.pointerFine` from
  tokens — use computed keys: `height: { default: "2.25rem", [consts.sm]: "2rem" }`.
- **`stylex.when.*` keys are only legal at the FIRST level of a condition
  object.** `color: { default: x, [stylex.when.ancestor(":active", m)]: y }` is
  fine; nesting one level deeper (a media query under the `when` key, or a
  `when` key under `default`) fails `valid-styles` with "Keys must be strings".
  When a `when`-driven property also needs a breakpoint, hoist the breakpoint
  into a CSS custom property on the ancestor (`"--thumb-size": { default: …,
[consts.sm]: … }`) and have the descendant read `var(--thumb-size)`.
  `consts.*` keys are exempt and work at any depth.
- **`stylex.defineMarker()` only compiles inside a `*.stylex.ts` file, bound
  to a named export.** In a component file it fails the build with "must be
  bound to a named export" or "Unable to generate hash for defineMarker()" —
  neither of which `oxlint` or `tsc` catch. All markers live in
  `src/styles/markers.stylex.ts`.
- A given `stylex.when.*` key may appear only ONCE per property. Writing it in
  two branches of a nested value object fails the build with "The same pseudo
  selector or at-rule cannot be used more than once".
- Grid line numbers must be strings: `gridColumnStart: "2"`, not `2`.
- The `sx` prop is typed `Sx` (from `../../styles/sx`), NOT
  `stylex.StyleXStyles` — the latter rejects any style whose pseudo-element
  layer carries conditions. See that file for the reasoning.
- **`structural.css` cannot override a StyleX declaration without
  `!important`.** With `useCSSLayers: false`, StyleX emits every atom as
  `.xxx:not(#\#):not(#\#)` — specificity (2,1,0), which no plain selector can
  outrank. A rule there can freely ADD a declaration StyleX does not set (that
  is the normal case), but overriding one always needs `!important`. The
  symptom is silent: the rule matches, `document.querySelectorAll` finds the
  element, and the computed value is still StyleX's.
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

## Translation recipes

- `sm:*` → `[consts.sm]` condition (mobile-first, exactly like Tailwind).
- `pointer-coarse:after:*` tap targets → `"::after"` namespace with
  `content: { default: "none", [consts.pointerCoarse]: '""' }` plus the
  geometry (`position: "absolute"`, `minHeight: "2.75rem"`, …).
- Focus rings: **use `outline`, not box-shadow rings** (avoids composing with
  the elevation shadows):
  - buttons/toggles: `outline: { default: "none", ":focus-visible": "2px solid <ring>" }`, `outlineOffset: 1`.
  - fields (Tailwind `ring-[3px] ring-ring/24` + border change):
    `outline: { default: "none", ":focus-within": "3px solid color-mix(in srgb, <ring> 24%, transparent)" }`
    plus `borderColor: { ..., ":focus-within": colors.ring }`. Invalid fields
    swap the ring color for destructive at 16–24%.
- Tailwind `has-focus-visible:` on wrappers → `":focus-within"` (accepted
  divergence). Tailwind `has-disabled:`/`has-aria-invalid:` on wrappers → put
  a `data-disabled`/`aria-invalid` attribute on the wrapper element itself in
  JSX (the component already knows the state via props) and match
  `"[data-disabled]"` — do NOT try `:has()`.
- Opacity-modified colors `bg-primary/90` →
  `color-mix(in srgb, ${colors.primary} 90%, transparent)` (template string —
  token interpolation is supported).
- `bg-clip-padding` (`not-dark:bg-clip-padding`) → `backgroundClip: "padding-box"`
  unconditionally (harmless in dark).
- The `before:` overlay pattern: `"::before"` namespace with
  `borderRadius: "inherit"` — do not replicate the
  `rounded-[calc(var(--radius-lg)-1px)]` dance; `inherit` + `inset: 0` is
  equivalent and simpler. Give it `boxShadow: shadows.edge`,
  `content: '""'`, `pointerEvents: "none"`, `position: "absolute"`.
- Descendant styling of ARBITRARY children (`[&_svg]:size-4`,
  `*:data-[slot=x]:*` where x is consumer content): move the rule to
  `src/styles/structural.css`, scoped under `[data-slot="…"]`, using plain CSS
  and the `--taiyo-*` hooks documented there. Add a `data-size`/`data-variant`
  attribute to the component root when the rule varies by size/variant. Keep
  structural.css MINIMAL — anything expressible on the element itself belongs
  in StyleX. Styling of children that the component itself renders is done in
  StyleX directly on that child.
- `cva` variants → a plain `styles`/`variantStyles` map +
  `stylex.props(styles.base, variantStyles[variant], sizeStyles[size], …, sx)`.
  If a `xxxVariants` export existed, re-export a function with the same
  signature returning `stylex.props(...).className ?? ""` so legacy callers
  keep working.
- Animations: `stylex.keyframes` (see skeleton.tsx). Transitions: plain
  `transitionProperty`/`transitionDuration`/`transitionTimingFunction`.
- CSS custom properties consumed from Base UI (e.g.
  `var(--anchor-width)`, `var(--available-height)`, `--thumb-size`) are plain
  strings in values: `minWidth: "var(--anchor-width)"`. Defining local custom
  props: use the style value on the element via the `style` prop or keep the
  computation in CSS vars only when Base UI sets them.

## Verification for every converted file

`oxlint` and `tsc` do NOT see StyleX compile errors — the compiler only runs
in the bundler. A file can pass both and still fail to build. Always finish
with the Storybook check.

1. `pnpm lint` and `pnpm exec tsc --noEmit` (run inside `packages/ui`) pass.
2. The component's story renders in Storybook (already wired with the StyleX
   compiler): `curl -sf "http://localhost:6006/iframe.html?id=<story-id>"`
   returns HTML, and no `Unexpected 'stylex.create' call` appears in the
   Storybook terminal log.
3. Visual parity with the pre-conversion Tailwind rendering in BOTH themes is
   the acceptance bar (the design language above, not the old flat look).
