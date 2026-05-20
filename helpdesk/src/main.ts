import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import * as express from 'express'
import { HttpExceptionFilter }
from './common/filters/http-exception.filter'

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    )

  // CORS (important pour login frontend)
  app.enableCors({
    origin: true,
    credentials: true,
  })

  // validation DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )

  // public/test.html
  app.use(
    express.static(
      join(process.cwd(), 'public'),
    ),
  )

  // uploads
  app.use(
    '/uploads',
    express.static(
      join(process.cwd(), 'uploads'),
    ),
  )

  app.useGlobalFilters(
    new HttpExceptionFilter(),
  )

  await app.listen(3000)

  console.log(
    'Server running on http://localhost:3000',
  )
}

bootstrap()