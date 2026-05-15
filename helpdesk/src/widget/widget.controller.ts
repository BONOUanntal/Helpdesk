import { Controller, Post, Get, Body, Param, Query, UploadedFile,
  UseInterceptors } from '@nestjs/common'
import { WidgetService } from './widget.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'

@Controller('widget')
export class WidgetController {
  constructor(private widgetService: WidgetService) {}

  // Route publique — pas de JwtAuthGuard
  @Post('ticket')
  createTicket(@Body() body: {
    apiKey: string
    subject: string
    priority: string
    issueTypeId: number
    clientEmail: string
    clientName?: string
  }) {
    return this.widgetService.createTicket(body)
  }

  @Get('issue-types')
  getIssueTypes() {
    return this.widgetService.getIssueTypes()
  }

  // Récupère les messages d'un ticket
  @Get('ticket/:ticketId/messages')
  getMessages(
    @Param('ticketId') ticketId: string,
    @Query('clientEmail') clientEmail: string,
    @Query('apiKey') apiKey: string,
  ) {
    return this.widgetService.getMessages(Number(ticketId), clientEmail, apiKey)
  }

  // Envoie un message client
  @Post('ticket/:ticketId/messages')
  sendMessage(
    @Param('ticketId') ticketId: string,
    @Body() body: { clientEmail: string; apiKey: string; content: string },
  ) {
    return this.widgetService.sendMessage(Number(ticketId), body)
  }

  // Récupère le ticket actif d'un client
  @Get('ticket/active')
  getActiveTicket(
    @Query('clientEmail') clientEmail: string,
    @Query('apiKey') apiKey: string,
  ) {
    return this.widgetService.getActiveTicket(clientEmail, apiKey)
  }

  @Post('tickets/:ticketId/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',

        filename: (req, file, cb) => {
          const unique = `${Date.now()}-${file.originalname}`
          cb(null, unique)
        },
      }),
    }),
  )
  uploadFile(
    @Param('ticketId') ticketId: string,

    @UploadedFile() file: Express.Multer.File,

    @Body() body: any,
  ) {
    return this.widgetService.uploadFile(
      Number(ticketId),
      file,
      body,
    )
  }
}