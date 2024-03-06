import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { ZodValidationPipe } from "nestjs-zod"
import { PermissionsGuard } from "~/guards"
import { TransformInterceptor } from "~/interceptors"
import { MediasModule } from "~/routes/medias/medias.module"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { BannersModule } from "./routes/banners/banners.module"
import { ChaptersModule } from "./routes/chapters/chapters.module"
import { CoversModule } from "./routes/covers/covers.module"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    MediasModule,
    ChaptersModule,
    CoversModule,
    BannersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
