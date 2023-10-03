import type { InferSelectModel } from "drizzle-orm";

import type { users } from "../schema/users";

export type User = InferSelectModel<typeof users>;
