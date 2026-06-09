import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        additionalRoles: {
            id: number;
            role: import(".prisma/client").$Enums.UserRole;
            userId: number;
        }[];
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    } | null>;
    updateRole(id: number, role: string): Promise<{
        id: number;
        name: string;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addRole(userId: number, role: string): Promise<{
        id: number;
        role: import(".prisma/client").$Enums.UserRole;
        userId: number;
    }>;
    removeRole(userId: number, role: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
