"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const common_2 = require("@nestjs/common");
let TicketsService = class TicketsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            throw new common_2.NotFoundException('Utilisateur introuvable');
        const client = await this.prisma.client.findFirst({
            where: { email: user.email },
            include: { application: true },
        });
        if (!client)
            throw new common_2.NotFoundException('Profil client introuvable');
        const ticket = await this.prisma.ticket.create({
            data: {
                subject: data.subject,
                status: data.status ?? 'OPEN',
                priority: data.priority,
                issueType: { connect: { id: data.issueTypeId } },
                application: { connect: { id: client.applicationId } },
                client: { connect: { id: client.id } },
            },
        });
        await this.prisma.notification.create({
            data: {
                userId: client.application.projectManagerId,
                ticketId: ticket.id,
                type: 'NEW_TICKET',
            },
        });
        return ticket;
    }
    async assign(ticketId, supportId, requesterId, role) {
        let ticket;
        if (role === 'ADMIN') {
            ticket = await this.prisma.ticket.findFirst({
                where: { id: ticketId },
            });
        }
        else if (role === 'PROJECT_MANAGER') {
            ticket = await this.prisma.ticket.findFirst({
                where: {
                    id: ticketId,
                    application: {
                        projectManagerId: requesterId,
                    },
                },
            });
        }
        else {
            throw new common_2.NotFoundException('Non autorisé');
        }
        if (!ticket) {
            throw new common_2.NotFoundException('Ticket introuvable ou non autorisé');
        }
        const updated = await this.prisma.ticket.update({
            where: { id: ticketId },
            data: {
                assignedTo: supportId,
            },
            include: {
                assignedUser: true,
            },
        });
        await this.prisma.notification.create({
            data: {
                userId: supportId,
                ticketId: ticket.id,
                type: 'NEW_TICKET',
            },
        });
        return updated;
    }
    async findOne(id, userId) {
        const ticket = await this.prisma.ticket.findFirst({
            where: {
                id,
                assignedTo: userId,
            },
            include: {
                application: true,
                client: true,
                issueType: true,
            },
        });
        if (!ticket) {
            throw new common_2.NotFoundException('Ticket not found');
        }
        return ticket;
    }
    async update(id, data, userId, role) {
        let ticket;
        if (role === 'ADMIN') {
            ticket = await this.prisma.ticket.findFirst({ where: { id } });
        }
        else if (role === 'PROJECT_MANAGER') {
            ticket = await this.prisma.ticket.findFirst({
                where: {
                    id,
                    application: { projectManagerId: userId },
                },
            });
        }
        else {
            ticket = await this.prisma.ticket.findFirst({
                where: { id, assignedTo: userId },
            });
        }
        if (!ticket)
            throw new common_2.NotFoundException('Ticket not found');
        return this.prisma.ticket.update({
            where: { id },
            data: {
                ...(data.subject !== undefined && { subject: data.subject }),
                ...(data.status !== undefined && { status: data.status }),
                ...(data.priority !== undefined && { priority: data.priority }),
            },
        });
    }
    async remove(id, userId) {
        const ticket = await this.prisma.ticket.findFirst({
            where: {
                id,
                assignedTo: userId,
            },
        });
        if (!ticket) {
            throw new common_2.NotFoundException('Ticket not found');
        }
        return this.prisma.ticket.delete({
            where: { id },
        });
    }
    async findAll(userId, role, clientId) {
        const include = {
            application: true,
            client: true,
            issueType: true,
            assignedUser: {
                select: { id: true, name: true, email: true }
            },
        };
        if (role === 'ADMIN') {
            return this.prisma.ticket.findMany({ include });
        }
        if (role === 'CLIENT') {
            return this.prisma.ticket.findMany({
                where: { clientId },
                include,
            });
        }
        if (role === 'SUPPORT') {
            return this.prisma.ticket.findMany({
                where: { assignedTo: userId },
                include,
            });
        }
        if (role === 'PROJECT_MANAGER') {
            return this.prisma.ticket.findMany({
                where: { application: { projectManagerId: userId } },
                include,
            });
        }
        return [];
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map