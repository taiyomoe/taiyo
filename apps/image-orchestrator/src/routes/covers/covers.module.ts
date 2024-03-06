import { Module } from "@nestjs/common"
import { MediasService } from "~/routes/medias/medias.service"
import { FilesService, PrismaService } from "~/services"
import { CoversController } from "./covers.controller"
import { CoversService } from "./covers.service"

@Module({
  controllers: [CoversController],
  providers: [CoversService, MediasService, FilesService, PrismaService],
  exports: [CoversService],
})
export class CoversModule {}
