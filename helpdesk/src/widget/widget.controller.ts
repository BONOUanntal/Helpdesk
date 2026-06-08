import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common'

import { WidgetService } from './widget.service'

import { FileInterceptor } from '@nestjs/platform-express'

import { diskStorage } from 'multer'
import { extname } from 'path'

const storage = diskStorage({
  destination: './uploads',

  filename: (
    req,
    file,
    cb,
  ) => {
    const unique =
      Date.now() +
      '-' +
      Math.round(
        Math.random() * 1e9,
      )

    cb(
      null,
      `${unique}${extname(
        file.originalname,
      )}`,
    )
  },
})

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

  @Post('ticket/recover-token')
  async recoverToken(
    @Body()
    body: {
      ticketId: number
      clientEmail: string
      apiKey: string
    },
  ) {
    return this.widgetService.recoverToken(
      body.ticketId,
      body.clientEmail,
      body.apiKey,
    )
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
      storage,

      limits: {
        fileSize: 2 * 1024 * 1024,
      },

      fileFilter: (
        req,
        file,
        cb,
      ) => {
        const allowed = [
          '.pdf',
          '.png',
          '.jpg',
          '.jpeg',
          '.txt',
          '.docx',
          '.xlsx',
          '.zip',
        ]

        const ext =
          extname(
            file.originalname,
          ).toLowerCase()

        if (
          !allowed.includes(ext)
        ) {
          return cb(
            new Error(
              'Type de fichier interdit',
            ),
            false,
          )
        }

        cb(null, true)
      },
    }),
  )
  uploadFile(
    @Param('ticketId') ticketId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Fichier invalide ou supérieur à 2MB',
      )
    }

    return this.widgetService.uploadFile(
      Number(ticketId),
      file,
      body.clientEmail,
      body.apiKey,
    )
  }
}