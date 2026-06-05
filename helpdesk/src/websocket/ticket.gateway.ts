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

@WebSocketGateway({
  cors: { origin: '*' },
})
export class TicketGateway {
  @WebSocketServer()
  server: Server

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService,
  ) {}

  // =========================
  // PM / ADMIN
  // =========================

  @SubscribeMessage('joinTicket')
  async handleJoin(
    @MessageBody() ticketId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`ticket:${ticketId}`)

    const messages =
      await this.messagesService.findByTicket(
        ticketId,
      )

    client.emit(
      'messageHistory',
      messages,
    )
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
            secret: 'secret123',
          },
        )

      const message =
        await this.messagesService.createFromSocket(
          data.ticketId,
          payload.userId,
          payload.role,
          data.content,
        )

      this.server
        .to(`ticket:${data.ticketId}`)
        .emit(
          'ticket:newMessage',
          message,
        )
    } catch (e) {
      client.emit(
        'error',
        {
          message:
            'Non autorisé',
        },
      )
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
        .to(
          `ticket:${data.ticketId}`,
        )
        .emit(
          'newMessage',
          message,
        )
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
}