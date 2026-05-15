import { MessagesService } from './messages.service';
export declare class MessagesController {
    private messagesService;
    constructor(messagesService: MessagesService);
    findAll(ticketId: string): Promise<({
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
    create(ticketId: string, body: {
        content: string;
    }, req: any): Promise<{
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
