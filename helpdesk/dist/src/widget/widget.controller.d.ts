import { WidgetService } from './widget.service';
export declare class WidgetController {
    private widgetService;
    constructor(widgetService: WidgetService);
    createTicket(body: {
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
    getMessages(ticketId: string, clientEmail: string, apiKey: string): Promise<{
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
    sendMessage(ticketId: string, body: {
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
    uploadFile(ticketId: string, file: Express.Multer.File, body: any): Promise<{
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
