import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('tickets/:ticketId/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get()
  findAll(@Param('ticketId') ticketId: string) {
    return this.messagesService.findByTicket(Number(ticketId))
  }

  @Post()
  create(
    @Param('ticketId') ticketId: string,
    @Body() body: { content: string },
    @Req() req: any,
  ) {
    return this.messagesService.create(
      Number(ticketId),
      req.user.userId,
      req.user.role,
      body.content,
    )
  }
}