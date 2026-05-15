import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findForUser(userId: number): Promise<({
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
    markAsRead(id: number, userId: number): Promise<{
        id: number;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        isRead: boolean;
        userId: number;
        ticketId: number | null;
    }>;
    markAllAsRead(userId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    countUnread(userId: number): Promise<number>;
}
