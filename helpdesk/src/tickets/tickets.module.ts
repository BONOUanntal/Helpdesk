import { Module } from '@nestjs/common'
import { TicketsService } from './tickets.service'
import { TicketsController } from './tickets.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { TicketGateway } from '../websocket/ticket.gateway'

@Module({
  imports: [PrismaModule],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    TicketGateway,
  ],
  exports: [
    TicketGateway,
  ],
})
export class TicketsModule {}