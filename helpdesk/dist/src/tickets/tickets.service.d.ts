import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
export declare class TicketsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: CreateTicketDto, userId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        priority: string;
        issueTypeId: number;
        status: string;
        applicationId: number;
        clientId: number;
        assignedTo: number | null;
    }>;
    assign(ticketId: number, supportId: number, requesterId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        priority: string;
        issueTypeId: number;
        status: string;
        applicationId: number;
        clientId: number;
        assignedTo: number | null;
    }>;
    findOne(id: number, userId: number): Promise<{
        application: {
            id: number;
            name: string;
            createdAt: Date;
            apiKey: string;
            projectManagerId: number;
        };
        client: {
            id: number;
            email: string | null;
            name: string | null;
            createdAt: Date;
            externalId: string;
            applicationId: number;
        };
        issueType: {
            id: number;
            name: string;
            description: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        priority: string;
        issueTypeId: number;
        status: string;
        applicationId: number;
        clientId: number;
        assignedTo: number | null;
    }>;
    update(id: number, data: UpdateTicketDto, userId: number, role: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        priority: string;
        issueTypeId: number;
        status: string;
        applicationId: number;
        clientId: number;
        assignedTo: number | null;
    }>;
    remove(id: number, userId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        priority: string;
        issueTypeId: number;
        status: string;
        applicationId: number;
        clientId: number;
        assignedTo: number | null;
    }>;
    findAll(userId: number, role: string, clientId?: number): Promise<({
        application: {
            id: number;
            name: string;
            createdAt: Date;
            apiKey: string;
            projectManagerId: number;
        };
        client: {
            id: number;
            email: string | null;
            name: string | null;
            createdAt: Date;
            externalId: string;
            applicationId: number;
        };
        issueType: {
            id: number;
            name: string;
            description: string | null;
        };
        assignedUser: {
            id: number;
            email: string;
            name: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        priority: string;
        issueTypeId: number;
        status: string;
        applicationId: number;
        clientId: number;
        assignedTo: number | null;
    })[]>;
}
