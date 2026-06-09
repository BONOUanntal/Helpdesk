import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
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
    findOne(id: string): Promise<{
        id: number;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    } | null>;
    updateRole(id: string, body: {
        role: string;
    }): Promise<{
        id: number;
        name: string;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: number;
        name: string;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addRole(id: string, body: {
        role: string;
    }): Promise<{
        id: number;
        role: import(".prisma/client").$Enums.UserRole;
        userId: number;
    }>;
    removeRole(id: string, role: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
