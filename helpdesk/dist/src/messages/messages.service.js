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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MessagesService = class MessagesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByTicket(ticketId) {
        return this.prisma.message.findMany({
            where: { ticketId },
            include: { attachments: true },
            orderBy: { createdAt: 'asc' },
        });
    }
    async createWidgetMessage(ticketId, clientEmail, content) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                client: true,
            },
        });
        if (!ticket) {
            throw new Error('Ticket introuvable');
        }
        if (ticket.client.email !==
            clientEmail) {
            throw new Error('Unauthorized');
        }
        return this.prisma.message.create({
            data: {
                ticketId,
                content,
                senderType: 'CLIENT',
            },
            include: {
                attachments: true,
            },
        });
    }
    async createFromSocket(ticketId, senderId, senderType, content) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                client: true,
                application: { include: { projectManager: true } },
            },
        });
        if (!ticket)
            throw new Error('Ticket introuvable');
        const message = await this.prisma.message.create({
            data: { ticketId, senderId, senderType, content },
            include: { attachments: true },
        });
        if (senderType === 'CLIENT') {
            await this.prisma.notification.create({
                data: {
                    userId: ticket.application.projectManagerId,
                    ticketId,
                    type: 'NEW_MESSAGE',
                },
            });
            if (ticket.assignedTo && ticket.assignedTo !== ticket.application.projectManagerId) {
                await this.prisma.notification.create({
                    data: { userId: ticket.assignedTo, ticketId, type: 'NEW_MESSAGE' },
                });
            }
        }
        else {
            if (ticket.client.email) {
                const clientUser = await this.prisma.user.findFirst({
                    where: { email: ticket.client.email },
                });
                if (clientUser) {
                    await this.prisma.notification.create({
                        data: { userId: clientUser.id, ticketId, type: 'NEW_MESSAGE' },
                    });
                }
            }
        }
        return message;
    }
    async create(ticketId, senderId, senderType, content) {
        return this.createFromSocket(ticketId, senderId, senderType, content);
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map