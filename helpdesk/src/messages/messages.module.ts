import { Module } from '@nestjs/common'
import { MessagesController } from './messages.controller'
import { MessagesService } from './messages.service'
import { PrismaModule } from '../prisma/prisma.module'
import { TicketsModule } from '../tickets/tickets.module'

@Module({
  imports: [PrismaModule, TicketsModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}