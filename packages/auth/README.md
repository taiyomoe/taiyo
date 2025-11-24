# `@taiyomoe/auth`

This package provides authentication functionality using better-auth.

## Usage

**Client-side:**

```ts
import { authClient } from "@taiyomoe/auth/client";

// Sign in
await authClient.signIn.email({ email, password });

// Get session
const { data: session } = await authClient.getSession();
```

**Server-side:**

```ts
import { auth } from "@taiyomoe/auth";

// Get session from headers
const session = await auth.api.getSession({ headers: request.headers });
```
