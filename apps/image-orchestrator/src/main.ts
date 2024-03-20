import { NestFactory } from "@nestjs/core"
import { ExpressAdapter, type NestExpressApplication } from "@nestjs/platform-express"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { patchNestJsSwagger } from "nestjs-zod"
import { AppModule } from "./app.module"

patchNestJsSwagger()

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(), {
    snapshot: true,
  })

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle("image-orchestrator")
    .setDescription("Image manipulation API for Taiyō.")
    .setVersion("2.0")
    .addCookieAuth("next-auth.session-token")
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api", app, document)

  await app.listen(4000, "0.0.0.0")
}

bootstrap()
