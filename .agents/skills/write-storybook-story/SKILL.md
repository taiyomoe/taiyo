---
name: write-storybook-story
description: Use when adding or rewriting a Storybook story for a component in `apps/storybook/stories/`, or when the user asks to "document" / "add a story for" a `@taiyomoe/ui` component. Covers CSF Next conventions (`preview.meta()` / `meta.story()`), the `@storybook/react-vite` framework wiring, and the paired `.docs.mdx` file. Do NOT use for stories outside `apps/storybook/` or for non-React Storybook setups.
license: MIT
---

# write-storybook-story

This project uses **Storybook 10 + `@storybook/react-vite` + CSF Next**. Stories are factory-based (`preview.meta().story()`), not the old `Meta`/`StoryObj` object form.

## When to use this skill

- Adding a new `<Name>.stories.tsx` under `apps/storybook/stories/`
- Rewriting an existing story (e.g. component primitive changed)
- Authoring or updating the paired `<Name>.docs.mdx`
- Debugging "story not showing up" or "preview.meta is not a function" issues

## When NOT to use this skill

- Stories for apps other than `@taiyomoe/storybook`
- Setting up a new Storybook instance from scratch (different scope)
- Writing non-CSF "play function" tests beyond what stories naturally support

## Project conventions

| Thing | Value |
|---|---|
| Framework | `@storybook/react-vite` (NOT `@storybook/nextjs-vite`) |
| Story file location | `apps/storybook/stories/<PascalName>.stories.tsx` |
| Docs file location | `apps/storybook/stories/<PascalName>.docs.mdx` |
| Component import | `@taiyomoe/ui/components/ui/<kebab-name>` |
| Preview import | `@/storybook/preview` (alias points to `apps/storybook/.storybook/preview.ts`) |
| Story title | `"UI/<PascalName>"` |
| Event mock | `import { fn } from "storybook/test"` (note: bare `storybook`, not `@storybook/test`) |
| Component primitives | Defined in `packages/ui/src/components/ui/<kebab-name>.tsx` (read this first to know the real API) |

## Required workflow

1. **Read the component source first**: `packages/ui/src/components/ui/<name>.tsx`. Note the prop names, variant unions, and which subcomponents are exported. Don't guess from memory — primitives change.
2. **Write the story** using the CSF Next template below.
3. **Write the docs** using the `.docs.mdx` template below. Every `<Canvas of={Stories.X} />` must reference a real exported story — verify before finishing.
4. **Run `pnpm lint`** to catch issues. Ignore pre-existing errors in `packages/ui/` (the primitives may have unrelated lint issues).

## Story template (CSF Next)

```tsx
import preview from "@/storybook/preview"
import { Component } from "@taiyomoe/ui/components/ui/component"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/Component",
  component: Component,
  parameters: { layout: "centered" },
  argTypes: {
    variant: { control: "select", options: ["default", "secondary"] },
    disabled: { control: "boolean" },
  },
  args: { onClick: fn() },
})

export const Default = meta.story({
  args: { children: "Click me" },
})

export const Disabled = meta.story({
  args: { disabled: true, children: "Click me" },
})

// Visual catalogs (variants, sizes, etc.) use a custom `render` and no args
export const Variants = meta.story({
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Component variant="default">Default</Component>
      <Component variant="secondary">Secondary</Component>
    </div>
  ),
})
```

### Things to NOT do (CSF Next gotchas)

- ❌ `import type { Meta, StoryObj } from "@storybook/..."` — the type-import-then-`satisfies` pattern is the old CSF3 style. Don't bring it back.
- ❌ `export default meta` — CSF Next wires the meta automatically; a default export will cause "Multiple default exports" / mis-titled stories.
- ❌ `export const X: Story = { ... }` — stories are produced by `meta.story()`, not annotated objects.
- ❌ Importing the preview as `import { preview } from ...` — `.storybook/preview.ts` uses `export default definePreview(...)`, so the import must be default.
- ❌ Referencing a helper component (e.g. `ProfileSheet`) inside the meta's `render` before the helper is declared — JS hoisting doesn't apply to `const` bindings. Declare helpers ABOVE the `preview.meta({...})` call.

## Docs (`.docs.mdx`) template

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks"
import * as ComponentStories from "./Component.stories"

<Meta title="UI/Component" />

# Component

[Source code](https://github.com/taiyomoe/taiyo/blob/develop/packages/ui/src/components/ui/component.tsx)

## Table of Contents

- [Overview](#overview)
  - [Variants](#variants)
  - [Disabled](#disabled)
- [Feedback](#feedback)

## Overview

One paragraph explaining what the component does and when to use it.

<Canvas of={ComponentStories.Default} />

### Variants

One sentence per non-trivial story explaining what it's showing.

<Canvas of={ComponentStories.Variants} />

### Disabled

<Canvas of={ComponentStories.Disabled} />

## Feedback

Help us improve this component by providing feedback, asking questions on [Discord](https://discord.gg/RYbnyeWcM2), or updating this file directly on [GitHub](https://github.com/taiyomoe/taiyo). Your feedback helps us create better components! 🚀
```

### Docs invariants

- The `[Source code]` link path must match the actual file location (currently `packages/ui/src/components/ui/<name>.tsx` — the `/ui/` segment matters).
- Every `<Canvas of={...} />` must reference a story exported from the sibling `.stories.tsx`. After editing, grep to verify (`grep -E "ComponentStories\." Component.docs.mdx`).
- The `# Component` H1 and `<Meta title="UI/Component" />` must match the story's `title`.
- Keep `## Feedback` block at the bottom verbatim — it's standard.

## What to showcase

A good story file demonstrates the component's real surface area. Cover both **shape** (visual variations driven by props) and **state** (runtime conditions the component reacts to). Always derive what's worth showing from the actual component source — never invent stories for props/states the component doesn't support.

### 1. Shape stories — one per visual axis

For each prop that meaningfully changes the rendering, create one showcase story that renders every option side-by-side. Common axes:

- **Variants** (`variant: "default" | "secondary" | "destructive" | …`) → a single `Variants` story
- **Sizes** (`size: "xs" | "sm" | "default" | "lg" | …`) → a single `Sizes` story
- **Colors / tones** (when separate from variant) → a single `Colors` story
- **Orientation** (`orientation: "horizontal" | "vertical"`) → a single `Vertical` story (the default direction doesn't need its own)
- **Side / placement** (`side: "top" | "right" | …`, `position`, `align`) → a single `Sides` / `Positions` / `Alignment` showcase
- **Layout modifiers** (`inset`, `bare`, density variants) → one story per non-default value

For each shape story, render real instances with hardcoded values inside a flex/grid wrapper (see "Composing showcase stories" below) rather than relying on controls. The goal is a visual catalog at a glance.

#### One story per axis — not per value

**Never create N stories that differ only by a single inner-prop value.** Four stories named `Top`/`Right`/`Bottom`/`Left` (each setting just `side`) is the same prop axis duplicated four times. Collapse into one `Sides` showcase that renders all four side-by-side in a flex wrapper. Same rule for `Positions` (Drawer/Toast), `Alignment` (Popover/Tooltip), and any future axis.

For trigger-based components, render one trigger per value in the showcase — each opens its own popover/sheet/drawer/etc.:

```tsx
// ❌ Don't — four stories, each setting one side
export const Top = meta.story({ args: { side: "top" } })
export const Right = meta.story({ args: { side: "right" } })
export const Bottom = meta.story({ args: { side: "bottom" } })
export const Left = meta.story({ args: { side: "left" } })

// ✅ Do — one Sides story with all four triggers
export const Sides = meta.story({
  render: () => (
    <div className="flex gap-2">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger render={<Button variant="outline" />}>{side}</SheetTrigger>
          <SheetContent side={side}>…</SheetContent>
        </Sheet>
      ))}
    </div>
  ),
})
```

A single non-default direction (e.g. `Vertical` on a horizontal-by-default Slider) is fine as a one-off story — the rule only kicks in when you'd otherwise need 2+ stories on the same axis.

### 2. State stories — one per applicable runtime state

Add a story for each state the component can actually enter. The common set:

- **`Disabled`** — when the component accepts `disabled` (or `aria-disabled`)
- **`Invalid`** — when the component accepts `aria-invalid` (form controls)
- **`Loading`** — when the component has a `loading` / pending prop (buttons, async controls)
- **`Checked` / `Indeterminate`** — for checkboxes, toggles
- **`SelectedByDefault`** — for selects/radios that support `defaultValue`
- **`Multiple`** — for selects/comboboxes that support `multiple`
- **`Open`** / **`Dismissible`** — for overlays where the open/dismissal behavior is a meaningful variation

### Do NOT force states that don't apply

A `Label` has no `disabled`, no `invalid`, no `loading` — don't fabricate a `Disabled` story by slapping `opacity-64` on it. A `Separator` has no variants. A `Spinner` has no `Disabled` state. If the prop/state doesn't exist on the component, the story shouldn't exist either. **Read the component source, list the real props, then write stories.**

### Heuristic

Before writing the stories, list everything the component accepts. For each item, decide:

| Prop / state | Story? |
|---|---|
| Discriminated union with 2+ values (`variant`, `size`, `side`) | ✅ one showcase story per axis |
| Boolean that flips a visible style (`disabled`, `loading`, `invalid`) | ✅ one story named after the state |
| `aria-*` attribute that triggers a styled state (`aria-invalid`) | ✅ one story |
| Compositional sub-parts (e.g. `MeterLabel`, `MeterValue`) | ✅ one `WithLabel` / `WithValue` story showing the composition |
| Pure data props (`value`, `placeholder`, `children`) | ❌ covered by `Default` + controls |
| Event handlers (`onClick`, `onValueChange`) | ❌ wire via `args: { onClick: fn() }` in meta, don't create a story |

## Composing showcase stories

For stories that demo multiple instances side-by-side (variants, sizes, density), use `render` with hardcoded elements rather than `args`. Wrap in a flex/grid container with `gap-*`:

```tsx
export const Sizes = meta.story({
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Component size="xs">XS</Component>
      <Component size="sm">SM</Component>
      <Component size="default">Default</Component>
    </div>
  ),
})
```

For stories that need a layout wrapper (e.g. fixed-width container so an Input shows realistically), put the wrapper in the meta-level `render` so every story inherits it:

```tsx
const meta = preview.meta({
  // ...
  render: (args) => (
    <div className="w-72">
      <Input {...args} />
    </div>
  ),
})
```

## Inline everything — no top-of-file helpers

Every story must be self-contained. Do NOT extract:

- Wrapper components (`ProfileSheet`, `CommandPalette`, `TooltipDemo`, etc.)
- Render helper functions (`renderItem`, `renderGroup`, etc.)
- Sub-layout components (`PaletteFooter`, `Inner`, `PositionTrigger`, etc.)

The full JSX lives inside each story's own `render` function. Duplication across stories is preferred over shared helpers — a reader should be able to understand a story end-to-end without jumping to a top-of-file definition.

Same rule applies to the meta-level `render`: don't define a default render that delegates to a wrapper component. Each story owns its render. Meta-level `args`/`argTypes` are still fine for controls.

```tsx
// ❌ Don't — top-of-file helper consumed by every story
const ProfileSheet = ({ side, ...args }: SheetStoryProps) => (
  <Sheet {...args}>
    <SheetTrigger render={<Button variant="outline" />}>Open</SheetTrigger>
    <SheetContent side={side}>{/* … */}</SheetContent>
  </Sheet>
)

const meta = preview.meta({
  // …
  render: (args) => <ProfileSheet {...args} />,
})

export const Default = meta.story({ args: { side: "right" } })
export const Sides = meta.story({
  render: () => (/* uses ProfileSheet again? Or duplicates? */),
})

// ✅ Do — each story renders its own JSX, no shared wrapper
const meta = preview.meta({
  title: "UI/Sheet",
  component: Sheet,
  parameters: { layout: "centered" },
  argTypes: { /* controls only */ },
})

export const Default = meta.story({
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Open</SheetTrigger>
      <SheetContent side="right">{/* … */}</SheetContent>
    </Sheet>
  ),
})

export const Sides = meta.story({
  render: () => (
    <div className="flex gap-2">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger render={<Button variant="outline" />}>Open {side}</SheetTrigger>
          <SheetContent side={side}>{/* … */}</SheetContent>
        </Sheet>
      ))}
    </div>
  ),
})
```

The only exception: small `const` arrays/objects of demo data (e.g. `const fruits = [...]`) used as `items` props or to drive `.map()` — those aren't components, they're just data.

### Component-specific composition invariants

Some primitives require structural wrappers that aren't visually obvious. Read the component source and respect these even when they look ceremonial:

- **`Menu`** — every `MenuItem` / `MenuCheckboxItem` / `MenuRadioGroup` / `MenuSub` must live inside a `MenuGroup`, even when the group has no `MenuGroupLabel`. Don't put items directly inside `MenuPopup` or `MenuSubPopup`. When you'd write a `<MenuSeparator />`, split the surrounding items into two `MenuGroup`s with the separator between them.
- **`Command`** — `CommandEmpty` goes immediately after `CommandInput`, NOT inside `CommandList`. `CommandFooter` goes inside `<Command>` after `<CommandPanel>`, NOT outside in `CommandDialogPopup`.
- **`Combobox`** — multiple-selection variant uses the chips composition: `<ComboboxChips><ComboboxValue>{(value) => …chip per value… + <ComboboxChipsInput />}</ComboboxValue></ComboboxChips>`. Don't reuse the single-select `<ComboboxInput />` for `multiple`.
- **`Autocomplete`** — `AutocompleteEmpty` goes directly inside `AutocompletePopup`, BEFORE `AutocompleteList` (NOT inside the list). The root accepts an `items` prop with the data array; render via function-children on `AutocompleteList` using the `{ value, label }` item shape: `<AutocompleteList>{(item) => <AutocompleteItem key={item.value} value={item}>{item.label}</AutocompleteItem>}</AutocompleteList>`. `defaultValue` is the input string, not a selected item object.

When in doubt, look for a "particle"-like example in the source comments or check how the component's docs example composes it — these invariants are easy to miss when reading types alone.

### Never auto-open full-page modal overlays

For components that render a **modal overlay covering the entire viewport** (Command palette, Dialog, AlertDialog, Drawer, Sheet, and any other full-screen modal), **never pass `defaultOpen={true}` or `open={true}` in any story — not even a dedicated showcase, not even an empty-state demo.** Every story must render the trigger in its closed state and let the viewer click to open it.

Why: Storybook's docs view renders every story in its own iframe simultaneously. A full-page modal that opens on mount leaks out of its canvas, overlaps neighbouring stories, blocks the controls/a11y addon panels, and produces noisy visual regressions on every snapshot. Even a single auto-opened modal story in the file breaks the docs page layout.

If you need to demonstrate inner content of the open state (e.g. the empty result of a Command palette), keep the trigger pattern (so the story stays consistent with the others) and **pre-seed the relevant control** so the inner state is visible the moment the user opens the modal. For Command, that means pre-typing a non-matching query via `<CommandInput defaultValue="zzz" />`:

```tsx
// ❌ Don't — auto-opens the dialog, breaks docs view
export const EmptyState = meta.story({
  render: () => (
    <CommandDialog defaultOpen>
      …
    </CommandDialog>
  ),
})

// ✅ Do — same trigger pattern as every other story, just with a pre-seeded query
export const EmptyState = meta.story({
  render: () => (
    <CommandDialog>
      <CommandDialogTrigger render={<Button variant="outline" />}>
        Open empty palette
      </CommandDialogTrigger>
      <CommandDialogPopup>
        <CommandPanel>
          <Command>
            <CommandInput defaultValue="zzz" placeholder="Type to search…" />
            <CommandEmpty>No results.</CommandEmpty>
            <CommandList>…</CommandList>
          </Command>
        </CommandPanel>
      </CommandDialogPopup>
    </CommandDialog>
  ),
})
```

### Out of scope (these CAN open by default)

This rule does **not** apply to:

- **Popover-style hovers / tethered popups**: Tooltip, Popover, PreviewCard, Menu, Select, Combobox — these anchor to a trigger and don't cover the viewport. A `DefaultOpen` showcase story is fine for these.
- **Inline expand/collapse**: Collapsible, Accordion — the panel just pushes content below it, doesn't overlay. `OpenByDefault` is fine.
- **Layout primitives**: Sidebar — "open" means "expanded with labels" as part of the page layout, not a popup. Default expanded is the canonical state.

For these, an explicit `DefaultOpen` / `OpenByDefault` showcase story is welcome.

```tsx
// ❌ Don't (full-page modals only)
export const Default = meta.story({ args: { defaultOpen: true } })

// ✅ Do (full-page modals only)
export const Default = meta.story({})

// ✅ Fine (tooltips, popovers, collapsibles, sidebars)
export const DefaultOpen = meta.story({ args: { defaultOpen: true } })
```

## Output checklist

Before returning a new/edited story or docs file:

- [ ] Component source was actually read (not guessed).
- [ ] No `Meta`/`StoryObj` type imports, no `default export meta`, no `: Story` annotations.
- [ ] `preview` imported from `@/storybook/preview` (default import).
- [ ] `fn` (if used) imported from `storybook/test`, not `@storybook/test`.
- [ ] Title is `"UI/<PascalName>"` and matches the docs `<Meta title>` + `# H1`.
- [ ] Every `argTypes.<key>` matches an actual prop on the component.
- [ ] For showcase stories, options arrays mirror the real variant union (no stale/removed values).
- [ ] Docs file's `<Canvas of={...} />` references all resolve to exported stories.
- [ ] Source link path uses `packages/ui/src/components/ui/<name>.tsx`.
- [ ] No top-of-file wrapper components, render helpers, or sub-layout helpers. Each story's JSX is fully inlined in its own `render`. Meta has no `render` field. (Demo-data consts like `const fruits = [...]` are fine.)
- [ ] No story on a full-page modal (Command, Dialog, AlertDialog, Drawer, Sheet, etc.) passes `defaultOpen`/`open={true}` — including dedicated showcases. For inner-state demos, render the inner component inline without its modal wrapper. Tooltip/Popover/Collapsible/Sidebar etc. are exempt.
- [ ] `pnpm lint` clean (ignoring pre-existing primitive-package errors).
