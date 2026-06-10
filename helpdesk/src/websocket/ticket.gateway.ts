import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { MessagesService } from '../messages/messages.service'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import { MailService } from '../mail/mail.service'
import * as fs from 'fs'
import * as path from 'path'

@WebSocketGateway({
  cors: { origin: '*' },
  maxHttpBufferSize: 1e7, // 10MB
})
export class TicketGateway {
  @WebSocketServer()
  server: Server

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private mailService: MailService,
  ) {}

  // =========================
  // PM / ADMIN
  // =========================

  @SubscribeMessage('joinTicket')
  async handleJoin(
    @MessageBody() ticketId: number,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('JOIN TICKET', ticketId, 'socket:', client.id)
    client.join(`ticket:${ticketId}`)
    
    const rooms = Array.from(client.rooms)
    console.log('ROOMS après join:', rooms)

    const messages = await this.messagesService.findByTicket(ticketId)
    console.log('MESSAGES TROUVÉS:', messages.length)
    
    client.emit('messageHistory', messages)
  }

  @SubscribeMessage('leaveTicket')
  handleLeave(
    @MessageBody() ticketId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`ticket:${ticketId}`)
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { ticketId: number; content: string; token: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('SEND MESSAGE reçu:', data.ticketId, data.content)
    try {
      const payload = this.jwtService.verify(data.token, { secret: 'secret123' })
      console.log('PAYLOAD:', payload)

      const message = await this.messagesService.createFromSocket(
        data.ticketId,
        payload.userId,
        payload.role,
        data.content,
      )
      console.log('MESSAGE CRÉÉ:', message.id)

      const room = `ticket:${data.ticketId}`
      const socketsInRoom = await this.server.in(room).fetchSockets()
      console.log('SOCKETS DANS LA ROOM:', socketsInRoom.length)

      this.server.to(room).emit('ticket:newMessage', message)
      console.log('ÉMIS vers', room)

    } catch (e) {
      console.log('ERREUR:', e.message)
      client.emit('error', { message: 'Non autorisé' })
    }
  }

  // =========================
  // WIDGET CLIENT
  // =========================

  @SubscribeMessage(
    'joinWidgetTicket',
  )
  async handleJoinWidget(
    @MessageBody()
    data: {
      ticketId: number
      clientEmail: string
      apiKey: string
    },
    @ConnectedSocket()
    client: Socket,
  ) {
    client.join(
      `ticket:${data.ticketId}`,
    )

    const messages =
      await this.messagesService.findByTicket(
        data.ticketId,
      )

    client.emit(
      'widgetMessageHistory',
      messages,
    )
  }

  @SubscribeMessage(
    'leaveWidgetTicket',
  )
  handleLeaveWidget(
    @MessageBody()
    ticketId: number,
    @ConnectedSocket()
    client: Socket,
  ) {
    client.leave(
      `ticket:${ticketId}`,
    )
  }

  @SubscribeMessage(
    'sendWidgetMessage',
  )
  async handleWidgetMessage(
    @MessageBody()
    data: {
      ticketId: number
      content: string
      token: string
    },
    @ConnectedSocket()
    client: Socket,
  ) {
    try {
      const payload =
        this.jwtService.verify(
          data.token,
          {
            secret:
              'secret123',
          },
        )

      const message =
        await this.messagesService.createWidgetMessage(
          data.ticketId,
          payload.clientEmail,
          data.content,
        )

      this.server
        .to(`ticket:${data.ticketId}`)
        .emit('ticket:newMessage', message)
    } catch (e) {
      client.emit(
        'error',
        {
          message:
            'Unauthorized',
        },
      )
    }
  }

  @SubscribeMessage('sendWidgetFile')
  async handleWidgetFile(
    @MessageBody()
    data: {
      ticketId: number
      token: string
      file: {
        name: string
        type: string
        size: number
        content: string
      }
    },
    @ConnectedSocket()
    client: Socket,
  ) {
    console.log('FILE EVENT HIT', data?.file?.name)
    try {
      const payload = this.jwtService.verify(data.token, {
        secret: 'secret123',
      })
      const clientEmail = payload.clientEmail

      const ticket = await this.prismaService.ticket.findFirst({
        where: {
          id: data.ticketId,
          client: {
            email: clientEmail,
          },
        },
        include: {
          application: {
            include: {
              projectManager: true,
            },
          },
          assignedUser: true,
          client: true,
        },
      })

      if (!ticket) {
        client.emit('error', { message: 'Ticket non trouvé ou non autorisé' })
        return
      }

      let base64Data = data.file.content
      if (base64Data.indexOf(';base64,') !== -1) {
        base64Data = base64Data.split(';base64,').pop() || ''
      }
      const buffer = Buffer.from(base64Data, 'base64')

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      const ext = path.extname(data.file.name).toLowerCase()
      const filename = `${uniqueSuffix}${ext}`
      const filepath = path.join('./uploads', filename)

      if (!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads', { recursive: true })
      }

      fs.writeFileSync(filepath, buffer)

      const message = await this.prismaService.message.create({
        data: {
          ticketId: data.ticketId,
          senderId: ticket.clientId,
          senderType: 'CLIENT',
          content: data.file.name,
          fileUrl: `/uploads/${filename}`,
          fileName: data.file.name,
          fileType: data.file.type,
        },
      })

      this.server
        .to(`ticket:${data.ticketId}`)
        .emit('ticket:newMessage', message)

      await this.prismaService.notification.create({
        data: {
          userId: ticket.application.projectManagerId,
          ticketId: ticket.id,
          type: 'NEW_MESSAGE',
        },
      })

      if (
        ticket.assignedTo &&
        ticket.assignedTo !== ticket.application.projectManagerId
      ) {
        await this.prismaService.notification.create({
          data: {
            userId: ticket.assignedTo,
            ticketId: ticket.id,
            type: 'NEW_MESSAGE',
          },
        })
      }

      if (ticket.application?.projectManager?.email) {
        try {
          await this.mailService.sendNewMessageEmail(
            ticket.application.projectManager.email,
            {
              ticketId: ticket.id,
              subject: ticket.subject,
              clientName: ticket.client?.name ?? undefined,
              clientEmail: ticket.client?.email ?? '',
              message: `📎 Fichier envoyé : ${data.file.name}`,
              appName: ticket.application.name,
            },
          )
        } catch (error) {
          console.error('Erreur email PM:', error)
        }
      }

      if (ticket.assignedUser?.email) {
        try {
          await this.mailService.sendNewMessageEmail(
            ticket.assignedUser.email,
            {
              ticketId: ticket.id,
              subject: ticket.subject,
              clientName: ticket.client?.name ?? undefined,
              clientEmail: ticket.client?.email ?? '',
              message: `📎 Fichier envoyé : ${data.file.name}`,
              appName: ticket.application.name,
            },
          )
        } catch (error) {
          console.error('Erreur email support:', error)
        }
      }

    } catch (e) {
      console.error('Error during sendWidgetFile:', e.message)
      client.emit('error', { message: 'Failed to upload file' })
    }
  }

  @SubscribeMessage('sendFile')
  async handleFile(
    @MessageBody()
    data: {
      ticketId: number
      token: string
      file: {
        name: string
        type: string
        size: number
        content: string
      }
    },
    @ConnectedSocket()
    client: Socket,
  ) {
    console.log('FILE EVENT HIT FOR BACKOFFICE', data?.file?.name)
    try {
      const payload = this.jwtService.verify(data.token, {
        secret: 'secret123',
      })
      const userId = payload.userId
      const role = payload.role

      if (!['ADMIN', 'PROJECT_MANAGER', 'SUPPORT'].includes(role)) {
        client.emit('error', { message: 'Non autorisé' })
        return
      }

      const ticket = await this.prismaService.ticket.findUnique({
        where: { id: data.ticketId },
        include: {
          client: true,
          application: {
            include: {
              projectManager: true,
            },
          },
        },
      })

      if (!ticket) {
        client.emit('error', { message: 'Ticket non trouvé' })
        return
      }

      let base64Data = data.file.content
      if (base64Data.indexOf(';base64,') !== -1) {
        base64Data = base64Data.split(';base64,').pop() || ''
      }
      const buffer = Buffer.from(base64Data, 'base64')

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      const ext = path.extname(data.file.name).toLowerCase()
      const filename = `${uniqueSuffix}${ext}`
      const filepath = path.join('./uploads', filename)

      if (!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads', { recursive: true })
      }

      fs.writeFileSync(filepath, buffer)

      const message = await this.prismaService.message.create({
        data: {
          ticketId: data.ticketId,
          senderId: userId,
          senderType: role,
          content: data.file.name,
          fileUrl: `/uploads/${filename}`,
          fileName: data.file.name,
          fileType: data.file.type,
        },
      })

      this.server
        .to(`ticket:${data.ticketId}`)
        .emit('ticket:newMessage', message)

      if (ticket.client.email) {
        const clientUser = await this.prismaService.user.findFirst({
          where: { email: ticket.client.email },
        })
        if (clientUser) {
          await this.prismaService.notification.create({
            data: {
              userId: clientUser.id,
              ticketId: ticket.id,
              type: 'NEW_MESSAGE',
            },
          })
        }
      }
    } catch (e) {
      console.error('Error during sendFile:', e.message)
      client.emit('error', { message: 'Failed to upload file' })
    }
  }

  // =========================
  // DELETE MESSAGE (backoffice : Admin / PM / Support)
  // =========================

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @MessageBody() data: { messageId: number; token: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const payload = this.jwtService.verify(data.token, { secret: 'secret123' })
      const role = payload.role
      const userId = payload.userId

      if (!['ADMIN', 'PROJECT_MANAGER', 'SUPPORT'].includes(role)) {
        client.emit('error', { message: 'Non autorisé' })
        return
      }

      const message = await this.prismaService.message.findUnique({
        where: { id: data.messageId },
      })

      if (!message) {
        client.emit('error', { message: 'Message introuvable' })
        return
      }

      // PM et SUPPORT ne peuvent supprimer que leurs propres messages
      // ADMIN peut supprimer n'importe quel message
      if (role !== 'ADMIN' && message.senderId !== userId) {
        client.emit('error', { message: 'Vous ne pouvez supprimer que vos propres messages' })
        return
      }

      // Supprimer le fichier physique si présent
      if (message.fileUrl) {
        const filepath = path.join('.', message.fileUrl)
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath)
        }
      }

      // Supprimer les pièces jointes associées
      await this.prismaService.attachment.deleteMany({
        where: { messageId: message.id },
      })

      // Supprimer le message
      await this.prismaService.message.delete({
        where: { id: message.id },
      })

      // Notifier tous les clients de la room
      this.server
        .to(`ticket:${message.ticketId}`)
        .emit('ticket:messageDeleted', { messageId: message.id })

    } catch (e) {
      console.error('Error during deleteMessage:', e.message)
      client.emit('error', { message: 'Échec de la suppression' })
    }
  }

  // =========================
  // DELETE WIDGET MESSAGE (client)
  // =========================

  @SubscribeMessage('deleteWidgetMessage')
  async handleDeleteWidgetMessage(
    @MessageBody() data: { messageId: number; token: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const payload = this.jwtService.verify(data.token, { secret: 'secret123' })
      const clientEmail = payload.clientEmail

      const message = await this.prismaService.message.findUnique({
        where: { id: data.messageId },
        include: {
          ticket: {
            include: { client: true },
          },
        },
      })

      if (!message) {
        client.emit('error', { message: 'Message introuvable' })
        return
      }

      // Vérifier que le message appartient bien au client authentifié
      if (
        message.senderType !== 'CLIENT' ||
        message.ticket.client.email !== clientEmail
      ) {
        client.emit('error', { message: 'Non autorisé' })
        return
      }

      // Supprimer le fichier physique si présent
      if (message.fileUrl) {
        const filepath = path.join('.', message.fileUrl)
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath)
        }
      }

      // Supprimer les pièces jointes associées
      await this.prismaService.attachment.deleteMany({
        where: { messageId: message.id },
      })

      // Supprimer le message
      await this.prismaService.message.delete({
        where: { id: message.id },
      })

      // Notifier tous les clients de la room
      this.server
        .to(`ticket:${message.ticketId}`)
        .emit('ticket:messageDeleted', { messageId: message.id })

    } catch (e) {
      console.error('Error during deleteWidgetMessage:', e.message)
      client.emit('error', { message: 'Échec de la suppression' })
    }
  }

}