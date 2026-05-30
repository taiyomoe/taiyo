# `@taiyomoe/logger`

This package provides logging functionality using Winston and HyperDX. Everything is logged to the console, and every log above debug is sent to HyperDX.

## Usage

```ts
import { createLogger } from "@taiyomoe/logger"

// Create a logger for a specific service
const logger = createLogger("api")

// Log messages
logger.debug("Debug message") // NOT sent to HyperDX
logger.info("Info message") // Sent to HyperDX
logger.warn("Warning message") // Sent to HyperDX
logger.error("Error message") // Sent to HyperDX
```
