import { PrismaService } from '../prisma/prisma.service';
export declare class WidgetService {
    private prisma;
    constructor(prisma: PrismaService);
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
        createdAt: Date;
        id: number;
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
        createdAt: Date;
        id: number;
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
    uploadFile(ticketId: number, file: Express.Multer.File, body: {
        clientEmail: string;
        apiKey: string;
    }): Promise<{
        createdAt: Date;
        id: number;
        ticketId: number;
        senderType: string;
        senderId: number | null;
        content: string;
        fileUrl: string | null;
        fileName: string | null;
        fileType: string | null;
    }>;
}
