import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { TicketGateway } from '../websocket/ticket.gateway';
export declare class WidgetService {
    private prisma;
    private mailService;
    private jwtService;
    private ticketGateway;
    constructor(prisma: PrismaService, mailService: MailService, jwtService: JwtService, ticketGateway: TicketGateway);
    private verifyApiKey;
    private findOrCreateClient;
    createTicket(data: {
        apiKey: string;
        subject: string;
        priority: string;
        issueTypeId: number;
        clientEmail: string;
        clientName?: string;
    }): Promise<{
        success: boolean;
        ticketId: number;
        widgetToken: string;
    }>;
    getIssueTypes(): Promise<{
        id: number;
        name: string;
        description: string | null;
    }[]>;
    getMessages(ticketId: number, clientEmail: string, apiKey: string): Promise<{
        id: number;
        createdAt: Date;
        ticketId: number;
        senderType: string;
        senderId: number | null;
        content: string;
        fileUrl: string | null;
        fileName: string | null;
        fileType: string | null;
    }[]>;
    sendMessage(ticketId: number, body: {
        clientEmail: string;
        apiKey: string;
        content: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        ticketId: number;
        senderType: string;
        senderId: number | null;
        content: string;
        fileUrl: string | null;
        fileName: string | null;
        fileType: string | null;
    }>;
    getActiveTicket(clientEmail: string, apiKey: string): Promise<{
        ticketId: null;
        widgetToken?: undefined;
    } | {
        ticketId: number;
        widgetToken: string;
    }>;
    uploadFile(ticketId: number, file: Express.Multer.File, clientEmail: string, apiKey: string): Promise<{
        id: number;
        createdAt: Date;
        ticketId: number;
        senderType: string;
        senderId: number | null;
        content: string;
        fileUrl: string | null;
        fileName: string | null;
        fileType: string | null;
    }>;
}
