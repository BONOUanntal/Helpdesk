import { Module } from '@nestjs/common'
import { WidgetController } from './widget.controller'
import { WidgetService } from './widget.service'
import { PrismaModule } from '../prisma/prisma.module'
import { MailModule } from '../mail/mail.module'
import { JwtModule } from '@nestjs/jwt'
import { WebsocketModule } from '../websocket/websocket.module'

@Module({
  imports: [PrismaModule, 
    MailModule,
    WebsocketModule,
    JwtModule.register({secret: 'secret123'}),
  ],
  controllers: [WidgetController],
  providers: [WidgetService],
})
export class WidgetModule {}