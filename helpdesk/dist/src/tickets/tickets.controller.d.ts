import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
export declare class TicketsController {
    private ticketsService;
    constructor(ticketsService: TicketsService);
    create(body: CreateTicketDto, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        applicationId: number;
        subject: string;
        status: string;
        priority: string;
        clientId: number;
        assignedTo: number | null;
        issueTypeId: number;
    }>;
    findAll(req: any): Promise<({
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
        applicationId: number;
        subject: string;
        status: string;
        priority: string;
        clientId: number;
        assignedTo: number | null;
        issueTypeId: number;
    })[]>;
    assign(id: string, body: {
        supportId: number;
    }, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        applicationId: number;
        subject: string;
        status: string;
        priority: string;
        clientId: number;
        assignedTo: number | null;
        issueTypeId: number;
    }>;
    findOne(id: string, req: any): Promise<{
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
        applicationId: number;
        subject: string;
        status: string;
        priority: string;
        clientId: number;
        assignedTo: number | null;
        issueTypeId: number;
    }>;
    update(id: string, body: UpdateTicketDto, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        applicationId: number;
        subject: string;
        status: string;
        priority: string;
        clientId: number;
        assignedTo: number | null;
        issueTypeId: number;
    }>;
    remove(id: string, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        applicationId: number;
        subject: string;
        status: string;
        priority: string;
        clientId: number;
        assignedTo: number | null;
        issueTypeId: number;
    }>;
    findEverything(req: any): Promise<({
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
        applicationId: number;
        subject: string;
        status: string;
        priority: string;
        clientId: number;
        assignedTo: number | null;
        issueTypeId: number;
    })[]>;
}
