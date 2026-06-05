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

@WebSocketGateway({cors: { origin: '*'}})

export class TicketGateway {
  @WebSocketServer()
  server: Server

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService,
  ) {}

  // Rejoindre la room d'un ticket
  @SubscribeMessage('joinTicket')
  async handleJoin(
    @MessageBody() ticketId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`ticket:${ticketId}`)

    // Envoie l'historique des messages au client qui rejoint
    const messages = await this.messagesService.findByTicket(ticketId)
    client.emit('messageHistory', messages)
  }

  // Quitter la room
  @SubscribeMessage('leaveTicket')
  handleLeave(
    @MessageBody() ticketId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`ticket:${ticketId}`)
  }

  // Recevoir et créer un message
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { ticketId: number; content: string; token: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Vérifie le token JWT
      const payload = this.jwtService.verify(data.token, {
        secret: 'secret123',
      })

      // Crée le message via le service
      const message = await this.messagesService.createFromSocket(
        data.ticketId,
        payload.userId,
        payload.role,
        data.content,
      )

      // Émet le message à tous dans la room
      this.server.to(`ticket:${data.ticketId}`).emit('newMessage', message)

    } catch (e) {
      console.log('JWT ERROR:', e.message) // ← ajoute ça
      client.emit('error', { message: 'Non autorisé' })
    }
  }
}