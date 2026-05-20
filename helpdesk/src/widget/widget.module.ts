import { Module } from '@nestjs/common'
import { WidgetController } from './widget.controller'
import { WidgetService } from './widget.service'
import { PrismaModule } from '../prisma/prisma.module'
import { MailModule } from '../mail/mail.module'

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [WidgetController],
  providers: [WidgetService],
})
export class WidgetModule {}