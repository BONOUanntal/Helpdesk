import { PrismaService } from '../prisma/prisma.service';
export declare class ApplicationsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findOne(id: number): Promise<({
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
    create(data: {
        name: string;
        projectManagerId: number;
    }): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        apiKey: string;
        projectManagerId: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        apiKey: string;
        projectManagerId: number;
    }>;
}
