import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
export declare class WidgetService {
    private prisma;
    private mailService;
    constructor(prisma: PrismaService, mailService: MailService);
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
    } | {
        ticketId: number;
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
