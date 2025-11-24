# `@taiyomoe/logger`

This package provides a Winston logger with HyperDX integration.

## Usage

```ts
import { logger } from "@taiyomoe/logger";

// Log messages
logger.info("User signed in", { userId });
logger.error("Failed to process request", { error });
```
