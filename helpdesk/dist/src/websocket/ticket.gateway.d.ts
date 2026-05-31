import { Server } from 'socket.io';
export declare class TicketGateway {
    server: Server;
    emitTicketUpdated(ticketId: number): void;
    emitNewMessage(ticketId: number): void;
}
