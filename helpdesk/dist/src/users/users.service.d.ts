import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        email: string;
        name: string;
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
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    } | null>;
    updateRole(id: number, role: string): Promise<{
        id: number;
        email: string;
        name: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        email: string;
        name: string;
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
