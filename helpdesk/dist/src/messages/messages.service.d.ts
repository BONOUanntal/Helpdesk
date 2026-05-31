import { PrismaService } from '../prisma/prisma.service';
import { TicketGateway } from '../websocket/ticket.gateway';
export declare class MessagesService {
    private prisma;
    private ticketGateway;
    constructor(prisma: PrismaService, ticketGateway: TicketGateway);
    findByTicket(ticketId: number): Promise<({
        attachments: {
            id: number;
            createdAt: Date;
            fileUrl: string;
            fileType: string;
            messageId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        ticketId: number;
        senderType: string;
        senderId: number | null;
        content: string;
        fileUrl: string | null;
        fileName: string | null;
        fileType: string | null;
    })[]>;
    create(ticketId: number, senderId: number, senderType: string, content: string): Promise<{
        attachments: {
            id: number;
            createdAt: Date;
            fileUrl: string;
            fileType: string;
            messageId: number;
        }[];
    } & {
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
