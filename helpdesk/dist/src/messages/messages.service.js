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
const ticket_gateway_1 = require("../websocket/ticket.gateway");
let MessagesService = class MessagesService {
    prisma;
    ticketGateway;
    constructor(prisma, ticketGateway) {
        this.prisma = prisma;
        this.ticketGateway = ticketGateway;
    }
    async findByTicket(ticketId) {
        return this.prisma.message.findMany({
            where: { ticketId },
            include: { attachments: true },
            orderBy: { createdAt: 'asc' },
        });
    }
    async create(ticketId, senderId, senderType, content) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                client: true,
                application: { include: { projectManager: true } },
            },
        });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket introuvable');
        const message = await this.prisma.message.create({
            data: { ticketId, senderId, senderType, content },
            include: { attachments: true },
        });
        this.ticketGateway.server.emit('newMessage', {
            ticketId,
            message,
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
                    data: {
                        userId: ticket.assignedTo,
                        ticketId,
                        type: 'NEW_MESSAGE',
                    },
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
                        data: {
                            userId: clientUser.id,
                            ticketId,
                            type: 'NEW_MESSAGE',
                        },
                    });
                }
            }
        }
        this.ticketGateway.emitNewMessage(ticketId);
        this.ticketGateway.emitTicketUpdated(ticketId);
        console.log('EMIT SOCKET', ticketId);
        this.ticketGateway.server.emit('newMessage', {
            ticketId,
            message,
        });
        return message;
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ticket_gateway_1.TicketGateway])
], MessagesService);
//# sourceMappingURL=messages.service.js.map