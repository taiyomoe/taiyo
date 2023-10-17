import type { InferSelectModel } from "drizzle-orm";

import type { users } from "~/lib/db/schema/users";

export type User = InferSelectModel<typeof users>;
