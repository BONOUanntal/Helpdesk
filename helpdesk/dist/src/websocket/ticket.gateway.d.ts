import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages/messages.service';
import { JwtService } from '@nestjs/jwt';
export declare class TicketGateway {
    private messagesService;
    private jwtService;
    server: Server;
    constructor(messagesService: MessagesService, jwtService: JwtService);
    handleJoin(ticketId: number, client: Socket): Promise<void>;
    handleLeave(ticketId: number, client: Socket): void;
    handleMessage(data: {
        ticketId: number;
        content: string;
        token: string;
    }, client: Socket): Promise<void>;
    handleJoinWidget(data: {
        ticketId: number;
        clientEmail: string;
        apiKey: string;
    }, client: Socket): Promise<void>;
    handleLeaveWidget(ticketId: number, client: Socket): void;
    handleWidgetMessage(data: {
        ticketId: number;
        content: string;
        token: string;
    }, client: Socket): Promise<void>;
    handleWidgetFile(data: any): Promise<void>;
}
