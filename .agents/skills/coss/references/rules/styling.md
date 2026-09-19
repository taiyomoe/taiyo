# Styling Rules (coss in this repo)

> The upstream coss registry ships its components styled with utility classes.
> **This repo does not.** `packages/ui` is styled entirely in StyleX, and there
> is no utility-class framework anywhere in the monorepo. When you pull a
> component or a particle from coss, you are taking its STRUCTURE, its Base UI
> composition and its accessibility wiring — its class strings are a starting
> point to translate, never something to paste.
>
> The full authoring guide, including the StyleX and lint constraints, is
> **`packages/ui/STYLEX.md`**. Read it before styling anything.

## Core rules

- Style with `stylex.create` + `stylex.props`. Colours, radii, shadows and
  fonts come from `packages/ui/src/styles/tokens.stylex.ts` — never a literal.
- A component exposes its styling channel as an `sx` prop (typed `Sx`), passed
  as the LAST argument to `stylex.props()` so callers win. `className` stays on
  the component as a plain DOM pass-through; nothing in this package styles
  through it.
- Prefer component variants/size props before reaching for `sx` at all.
- Use `flex`/`gap` layouts; there is no `space-*` equivalent and none is wanted.
- Before adding layout styles, check whether the part already provides them.
- Conditions live INSIDE property values
  (`color: { default: x, ":hover": y, "[data-checked]": z }`), never as
  style-level blocks — the repo lint bans those.

## coss-specific expectations

- Do not use numeric icon `size` props. Icon geometry is set by
  `packages/ui/src/styles/structural.css`, which sizes consumer icons per
  `data-slot`; add a new `data-slot` there when you add a component that takes
  icon children.
- For icons, default to `aria-hidden="true"` when the icon is decorative or
  redundant; do not hide icons that carry unique semantic meaning.
- Many primitives already define inner SVG sizing and opacity. Check the
  component before overriding either.
- `:has()`, `:not()` and `:is()` are lint-banned. When a wrapper needs to react
  to the control inside it, mirror the state onto the wrapper as a data
  attribute in JSX and match `"[data-…]"`.
- Cancel/close buttons in Dialog, AlertDialog, Sheet, and Drawer footers use
  `variant="ghost"`. Reserve `variant="outline"` for triggers that open
  overlays, not for dismissing them.

## Global styling setup (when relevant)

Apply this section only when the task touches global theme/layout setup.

- The token architecture is `tokens.stylex.ts`. `globals.css` mirrors only the
  handful of semantic colours `structural.css` needs to read from plain CSS —
  change one and change the other.
- A component must never know which theme is live. If light and dark need
  different values, add a semantic token pair, do not branch.
- For Base UI portal layering, keep an isolated application root wrapper
  (`isolation: "isolate"` on the root container).
- For iOS Safari compatibility, ensure `body` has `position: relative` when
  configuring global layout for portaled backdrops.

### Font contract

Three faces, all read from the `font` token group in `tokens.stylex.ts`:

| Token          | Used by                                        |
| -------------- | ---------------------------------------------- |
| `font.sans`    | body text, buttons, labels, most UI            |
| `font.mono`    | `<code>`, `<kbd>`, `<pre>`, code blocks        |
| `font.heading` | Dialog/AlertDialog titles, headings            |

`reset.css` also reads `--font-sans` / `--font-mono` (declared in
`globals.css`) so untouched elements inherit the right face. Both families are
self-hosted through `@fontsource-variable/*`; there is no CDN font.

## Do / Don't

```tsx
// Do
<Button variant="outline" size="sm" />
<div {...stylex.props(styles.column)} />
<Badge sx={styles.muted} />
<Button>
  <PlusIcon aria-hidden="true" />
  Add item
</Button>

// Don't — utility classes do not exist in this repo, and they will not warn
<Button className="bg-blue-500 text-white" />
<div className="flex flex-col gap-3" />
<Icon size={16} />
```

```ts
// Do — colours come from the tokens, tints from color-mix
backgroundColor: `color-mix(in srgb, ${colors.primary} 8%, transparent)`

// Don't — a literal colour bypasses the theme and breaks in dark
backgroundColor: "#f2452d"
```

## Check before finalizing

1. Any literal colour that should be a token?
2. Any duplicate layout/style logic already handled by a primitive?
3. Any icon sized in the component that `structural.css` already sizes?
4. Any decorative interactive icons missing `aria-hidden="true"`?
5. Does it look right in BOTH themes? (`oxlint` and `tsc` do not see StyleX
   compile errors — build Storybook.)
