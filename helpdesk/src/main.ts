import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import * as express from 'express'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.enableCors({
    origin: '*',
  })

  app.useStaticAssets(join(process.cwd(), 'public'))

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')))

  await app.listen(3000)
}
bootstrap()