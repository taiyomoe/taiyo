import { pino } from "pino"
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
  pino({
    level: "debug",
    base: {
      pid: undefined,
      hostname: undefined,
    },
    transport: {
      targets: [
        {
          target: "pino-pretty",
          level: "debug",
        },
        {
          target: "pino-loki",
          level: "debug",
          options: {
            batching: true,
            interval: 5,
            labels: {
              app,
              environment: process.env.NODE_ENV ?? "development",
            },
            host: env.GRAFANA_LOKI_URL,
            basicAuth: {
              username: env.GRAFANA_USERNAME,
              password: env.GRAFANA_PASSWORD,
            },
          },
        },
      ],
    },
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
