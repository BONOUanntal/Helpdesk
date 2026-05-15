import { ApplicationsService } from './applications.service';
export declare class ApplicationsController {
    private applicationsService;
    constructor(applicationsService: ApplicationsService);
    findAll(): Promise<({
        projectManager: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        apiKey: string;
        projectManagerId: number;
    })[]>;
    findOne(id: string): Promise<({
        projectManager: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        apiKey: string;
        projectManagerId: number;
    }) | null>;
    create(body: {
        name: string;
        projectManagerId: number;
    }): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        apiKey: string;
        projectManagerId: number;
    }>;
    remove(id: string): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        apiKey: string;
        projectManagerId: number;
    }>;
}
