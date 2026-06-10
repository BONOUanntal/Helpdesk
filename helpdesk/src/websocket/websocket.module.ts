import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { TicketGateway } from './ticket.gateway'
import { MessagesModule } from '../messages/messages.module'
import { PrismaModule } from '../prisma/prisma.module'
import { MailModule } from '../mail/mail.module'

@Module({
  imports: [
    MessagesModule,
    JwtModule.register({
      secret: 'secret123',
    }),
    PrismaModule,
    MailModule,
  ],
  providers: [TicketGateway],
  exports: [TicketGateway],
})
export class WebsocketModule {}