import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(req: any): Promise<({
        ticket: {
            id: number;
            subject: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        isRead: boolean;
        userId: number;
        ticketId: number | null;
    })[]>;
    countUnread(req: any): Promise<number>;
    markAsRead(id: string, req: any): Promise<{
        id: number;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        isRead: boolean;
        userId: number;
        ticketId: number | null;
    }>;
    markAllAsRead(req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
