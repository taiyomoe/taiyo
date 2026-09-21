# `@taiyomoe/ui`

React components, styled with StyleX. See [STYLEX.md](./STYLEX.md) for the
design language and the compiler's constraints.

Components are imported by path — there is no root barrel:

```tsx
import { Button } from "@taiyomoe/ui/components/ui/button"

;<Button variant="default" size="lg">
  Click me
</Button>
```

Caller styles go through `sx`, which merges last and therefore wins:

```tsx
<Button sx={styles.submit}>Save</Button>
```
