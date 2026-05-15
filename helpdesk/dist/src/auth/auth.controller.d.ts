import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
        role?: any;
    }): Promise<{
        message: string;
        userId: number;
    }>;
    me(req: any): any;
}
