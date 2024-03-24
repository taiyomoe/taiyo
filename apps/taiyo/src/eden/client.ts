import { treaty } from "@elysiajs/eden"
import type { App } from "@taiyomoe/image-orchestrator"

export const ioApi = treaty<App>("localhost:4000").v3
