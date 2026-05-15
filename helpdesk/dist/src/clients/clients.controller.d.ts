import { ClientsService } from './clients.service';
export declare class ClientsController {
    private clientsService;
    constructor(clientsService: ClientsService);
    findAll(): Promise<({
        application: {
            id: number;
            name: string;
        };
    } & {
        id: number;
        email: string | null;
        name: string | null;
        createdAt: Date;
        externalId: string;
        applicationId: number;
    })[]>;
    findOne(id: string): Promise<({
        application: {
            id: number;
            name: string;
            createdAt: Date;
            apiKey: string;
            projectManagerId: number;
        };
    } & {
        id: number;
        email: string | null;
        name: string | null;
        createdAt: Date;
        externalId: string;
        applicationId: number;
    }) | null>;
}
