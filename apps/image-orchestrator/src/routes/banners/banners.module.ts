import { Module } from "@nestjs/common"
import { MediasService } from "~/routes/medias/medias.service"
import { FilesService, PrismaService } from "~/services"
import { BannersController } from "./banners.controller"
import { BannersService } from "./banners.service"

@Module({
  controllers: [BannersController],
  providers: [BannersService, MediasService, FilesService, PrismaService],
})
export class BannersModule {}
