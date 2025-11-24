# `@taiyomoe/cache`

This package provides a cache client using Dragonfly (Redis-compatible).

## Usage

```ts
import { cacheClient } from "@taiyomoe/cache";

// Set cache
await cacheClient.users.auth.set("user-id", "token", 60);

// Get cache
const token = await cacheClient.users.auth.get("user-id");

// Invalidate cache
await cacheClient.users.auth.invalidate("user-id");
```
