import { PrismaService } from '../prisma/prisma.service';
export declare class IssueTypesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        name: string;
        description: string | null;
    }[]>;
    create(data: {
        name: string;
        description?: string;
    }): Promise<{
        id: number;
        name: string;
        description: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        description: string | null;
    }>;
}
