import type { InferSelectModel } from "drizzle-orm";

import type { scans } from "~/lib/db/schema/scans";

export type Scan = InferSelectModel<typeof scans>;
