import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { TicketGateway } from './ticket.gateway'
import { MessagesModule } from '../messages/messages.module'

@Module({
  imports: [
    MessagesModule,
    JwtModule.register({
      secret: 'secret123',
    }),
  ],
  providers: [TicketGateway],
  exports: [TicketGateway],
})
export class WebsocketModule {}