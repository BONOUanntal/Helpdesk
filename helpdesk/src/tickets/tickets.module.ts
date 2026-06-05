import { Module } from '@nestjs/common'
import { TicketsService } from './tickets.service'
import { TicketsController } from './tickets.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { WebsocketModule } from '../websocket/websocket.module'

@Module({
  imports: [
    PrismaModule,
    WebsocketModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}