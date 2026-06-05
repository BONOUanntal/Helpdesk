import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { TicketsModule } from './tickets/tickets.module'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ApplicationsModule } from './applications/applications.module'
import { ClientsModule } from './clients/clients.module'
import { MessagesModule } from './messages/messages.module'
import { IssueTypesModule } from './issue-types/issue-types.module'
import { NotificationsModule } from './notifications/notifications.module'
import { WidgetModule } from './widget/widget.module'
import { MailModule } from './mail/mail.module'
import { WebsocketModule } from './websocket/websocket.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TicketsModule,
    UsersModule,
    ApplicationsModule,
    ClientsModule,
    MessagesModule,
    IssueTypesModule,
    NotificationsModule,
    WidgetModule,
    MailModule,
    WebsocketModule,
  ],
})
export class AppModule {}