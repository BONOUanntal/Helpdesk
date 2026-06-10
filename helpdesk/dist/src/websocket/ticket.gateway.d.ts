import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages/messages.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
export declare class TicketGateway {
    private messagesService;
    private jwtService;
    private prismaService;
    private mailService;
    server: Server;
    constructor(messagesService: MessagesService, jwtService: JwtService, prismaService: PrismaService, mailService: MailService);
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
    handleWidgetFile(data: {
        ticketId: number;
        token: string;
        file: {
            name: string;
            type: string;
            size: number;
            content: string;
        };
    }, client: Socket): Promise<void>;
    handleFile(data: {
        ticketId: number;
        token: string;
        file: {
            name: string;
            type: string;
            size: number;
            content: string;
        };
    }, client: Socket): Promise<void>;
    handleDeleteMessage(data: {
        messageId: number;
        token: string;
    }, client: Socket): Promise<void>;
    handleDeleteWidgetMessage(data: {
        messageId: number;
        token: string;
    }, client: Socket): Promise<void>;
}
