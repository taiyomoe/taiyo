import type { InferSelectModel } from "drizzle-orm";

import type { scans } from "../schema/scans";

export type Scan = InferSelectModel<typeof scans>;
