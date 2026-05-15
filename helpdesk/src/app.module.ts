import { Module } from '@nestjs/common';
import { TicketsModule } from './tickets/tickets.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module'
import { ApplicationsModule } from './applications/applications.module'
import { ClientsModule } from './clients/clients.module'
import { MessagesModule } from './messages/messages.module'
import { IssueTypesModule } from './issue-types/issue-types.module'
import { NotificationsModule } from './notifications/notifications.module'
import { WidgetModule } from './widget/widget.module'


@Module({
  imports: [TicketsModule, PrismaModule, AuthModule, 
    UsersModule, ApplicationsModule, ClientsModule, 
    MessagesModule, IssueTypesModule, NotificationsModule, WidgetModule],
})
export class AppModule {}