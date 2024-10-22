import { createLogger, format, transports } from "winston"
import LokiTransport from "winston-loki"
import { env } from "./env"
import { ChaptersService } from "./services/chapters.logs-service"
import { CoversService } from "./services/covers.logs-service"
import { MediasService } from "./services/medias.logs-service"
import { MigrationsService } from "./services/migrations.logs-service"
import { ScansService } from "./services/scans.logs-service"
import { TitlesService } from "./services/titles.logs-service"
import { TrackersService } from "./services/trackers.logs-service"
import { UsersActivityService } from "./services/users-activity.logs-service"
import { UsersAuthService } from "./services/users-auth.logs-service"
import { UsersSettingsService } from "./services/users-settings.logs-service"

export const initLogger = (app: "taiyo" | "image-orchestrator" | "io-worker") =>
  createLogger({
    level: "debug",
    transports: [
      new transports.Console({
        format: format.prettyPrint({ colorize: true }),
      }),
      new LokiTransport({
        host: env.GRAFANA_LOKI_URL,
        labels: { app },
        batching: true,
        json: true,
        basicAuth: `${env.GRAFANA_USERNAME}:${env.GRAFANA_PASSWORD}`,
      }),
    ],
  })

export const logsClient = {
  migrations: MigrationsService,
  medias: MediasService,
  covers: CoversService,
  titles: TitlesService,
  trackers: TrackersService,
  chapters: ChaptersService,
  scans: ScansService,
  users: {
    auth: UsersAuthService,
    activity: UsersActivityService,
    settings: UsersSettingsService,
  },
}

export * from "./types"
