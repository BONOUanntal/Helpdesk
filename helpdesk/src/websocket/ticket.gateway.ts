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

  @SubscribeMessage(
  'sendWidgetFile',
)
async handleWidgetFile(
  @MessageBody() data: any,
) {
  console.log(
    'FILE RECEIVED'
  )

  console.log(data)
}
}