import type { InferSelectModel } from "drizzle-orm";

import type { roles } from "../schema/roles";

export type Role = InferSelectModel<typeof roles>;
