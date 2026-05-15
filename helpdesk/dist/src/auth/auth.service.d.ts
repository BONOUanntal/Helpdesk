import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
export declare class AuthService {
    private jwtService;
    private prisma;
    constructor(jwtService: JwtService, prisma: PrismaService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            roles: import(".prisma/client").$Enums.UserRole[];
        };
    }>;
    register(body: {
        email: string;
        password: string;
        name: string;
        role?: UserRole;
    }): Promise<{
        message: string;
        userId: number;
    }>;
}
