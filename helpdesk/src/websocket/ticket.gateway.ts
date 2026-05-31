import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TicketGateway {
  @WebSocketServer()
  server: Server

  emitTicketUpdated(ticketId: number) {
    this.server.emit('ticketUpdated', {
      ticketId,
    })
  }

  emitNewMessage(ticketId: number) {
    this.server.emit('newMessage', {
      ticketId,
    })
  }
}