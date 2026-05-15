import { PrismaService } from '../prisma/prisma.service';
export declare class ClientsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findOne(id: number): Promise<({
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
