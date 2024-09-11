import { createClient } from "@clickhouse/client-web"
import { env } from "../env"
import { chaptersService } from "./services/chapters.logsService"
import { migrationsService } from "./services/migrations.logsService"
import { scansService } from "./services/scans.logsService"
import { usersActivityService } from "./services/usersActivity.logsService"
import { usersAuthService } from "./services/usersAuth.logsService"
import { usersSettingsService } from "./services/usersSettings.logsService"

export const rawLogsClient = createClient({
  url: env.CLICKHOUSE_URL,
  clickhouse_settings: {
    allow_experimental_json_type: 1,
    date_time_input_format: "best_effort",
  },
})

export const logsClient = {
  migrations: migrationsService,
  chapters: chaptersService,
  users: {
    auth: usersAuthService,
    activity: usersActivityService,
    settings: usersSettingsService,
  },
  scans: scansService,
}

export * from "./types"
