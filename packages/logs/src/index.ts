import { createClient } from "@clickhouse/client-web"
import { createLogger, format, transports } from "winston"
import LokiTransport from "winston-loki"
import { env } from "./env"
import { chaptersService } from "./services/chapters.logsService"
import { coversService } from "./services/covers.logsService"
import { mediasService } from "./services/medias.logsService"
import { migrationsService } from "./services/migrations.logsService"
import { scansService } from "./services/scans.logsService"
import { titlesService } from "./services/titles.logsService"
import { trackersService } from "./services/trackers.logsService"
import { usersActivityService } from "./services/usersActivity.logsService"
import { usersAuthService } from "./services/usersAuth.logsService"
import { usersSettingsService } from "./services/usersSettings.logsService"

export const initLogger = (app: "taiyo" | "image-orchestrator") =>
  createLogger({
    level: "debug",
    format: format.json(),
    transports: [
      new transports.Console(),
      new LokiTransport({
        host: env.GRAFANA_LOKI_URL,
        labels: { app },
        json: true,
        basicAuth: `${env.GRAFANA_USERNAME}:${env.GRAFANA_PASSWORD}`,
      }),
    ],
  })

export const rawLogsClient = createClient({
  url: env.CLICKHOUSE_URL,
  clickhouse_settings: {
    allow_experimental_object_type: 1,
    date_time_input_format: "best_effort",
  },
})

export const logsClient = {
  migrations: migrationsService,
  medias: mediasService,
  covers: coversService,
  titles: titlesService,
  trackers: trackersService,
  chapters: chaptersService,
  scans: scansService,
  users: {
    auth: usersAuthService,
    activity: usersActivityService,
    settings: usersSettingsService,
  },
}

export * from "./types"
