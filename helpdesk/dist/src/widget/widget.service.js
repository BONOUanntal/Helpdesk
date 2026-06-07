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
exports.WidgetService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
const jwt_1 = require("@nestjs/jwt");
const ticket_gateway_1 = require("../websocket/ticket.gateway");
let WidgetService = class WidgetService {
    prisma;
    mailService;
    jwtService;
    ticketGateway;
    constructor(prisma, mailService, jwtService, ticketGateway) {
        this.prisma = prisma;
        this.mailService = mailService;
        this.jwtService = jwtService;
        this.ticketGateway = ticketGateway;
    }
    async verifyApiKey(apiKey) {
        const application = await this.prisma.application.findUnique({
            where: { apiKey },
            include: {
                projectManager: true,
            },
        });
        if (!application) {
            throw new common_1.UnauthorizedException('API key invalide');
        }
        return application;
    }
    async findOrCreateClient(email, name, applicationId) {
        let client = await this.prisma.client.findFirst({
            where: {
                email,
                applicationId,
            },
        });
        if (!client) {
            client = await this.prisma.client.create({
                data: {
                    externalId: `widget-${Date.now()}`,
                    email,
                    name: name || email,
                    applicationId,
                },
            });
        }
        return client;
    }
    async createTicket(data) {
        const application = await this.verifyApiKey(data.apiKey);
        const client = await this.findOrCreateClient(data.clientEmail, data.clientName ?? data.clientEmail, application.id);
        const issueType = await this.prisma.issueType.findUnique({
            where: {
                id: data.issueTypeId,
            },
        });
        if (!issueType) {
            throw new common_1.NotFoundException('Type de problème introuvable');
        }
        const ticket = await this.prisma.ticket.create({
            data: {
                subject: data.subject,
                status: 'OPEN',
                priority: data.priority,
                application: {
                    connect: {
                        id: application.id,
                    },
                },
                client: {
                    connect: {
                        id: client.id,
                    },
                },
                issueType: {
                    connect: {
                        id: data.issueTypeId,
                    },
                },
            },
        });
        await this.prisma.notification.create({
            data: {
                userId: application.projectManagerId,
                ticketId: ticket.id,
                type: 'NEW_TICKET',
            },
        });
        if (application.projectManager?.email) {
            try {
                await this.mailService.sendNewTicketEmail(application.projectManager.email, {
                    ticketId: ticket.id,
                    subject: ticket.subject,
                    clientEmail: client.email ?? '',
                    clientName: client.name ?? undefined,
                    priority: ticket.priority,
                    appName: application.name,
                });
                console.log('✅ Email envoyé au PM');
            }
            catch (error) {
                console.error('❌ Erreur email PM:', error);
            }
        }
        const widgetToken = this.jwtService.sign({
            ticketId: ticket.id,
            clientEmail: client.email,
            role: 'CLIENT_WIDGET',
        }, {
            secret: 'secret123',
            expiresIn: '30d',
        });
        return {
            success: true,
            ticketId: ticket.id,
            widgetToken,
        };
    }
    async getIssueTypes() {
        return this.prisma.issueType.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    }
    async getMessages(ticketId, clientEmail, apiKey) {
        const application = await this.verifyApiKey(apiKey);
        const ticket = await this.prisma.ticket.findFirst({
            where: {
                id: ticketId,
                applicationId: application.id,
                client: {
                    email: clientEmail,
                },
            },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket introuvable');
        }
        return this.prisma.message.findMany({
            where: {
                ticketId,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }
    async sendMessage(ticketId, body) {
        const application = await this.verifyApiKey(body.apiKey);
        const ticket = await this.prisma.ticket.findFirst({
            where: {
                id: ticketId,
                applicationId: application.id,
                client: {
                    email: body.clientEmail,
                },
            },
            include: {
                application: {
                    include: {
                        projectManager: true,
                    },
                },
                assignedUser: true,
                client: true,
            },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket introuvable');
        }
        const client = await this.prisma.client.findFirst({
            where: {
                email: body.clientEmail,
                applicationId: application.id,
            },
        });
        const message = await this.prisma.message.create({
            data: {
                ticketId,
                senderId: client?.id ?? null,
                senderType: 'CLIENT',
                content: body.content,
            },
        });
        this.ticketGateway.server
            .to(`ticket:${ticketId}`)
            .emit('ticket:newMessage', message);
        if (ticket.application
            ?.projectManager
            ?.email) {
            try {
                await this.mailService
                    .sendNewMessageEmail(ticket.application
                    .projectManager
                    .email, {
                    ticketId: ticket.id,
                    subject: ticket.subject,
                    clientName: ticket.client
                        ?.name ??
                        undefined,
                    clientEmail: ticket.client
                        ?.email ??
                        '',
                    message: body.content,
                    appName: ticket.application
                        .name,
                });
            }
            catch (error) {
                console.error('Erreur email PM', error);
            }
        }
        if (ticket.assignedUser
            ?.email) {
            try {
                await this.mailService
                    .sendNewMessageEmail(ticket.assignedUser
                    .email, {
                    ticketId: ticket.id,
                    subject: ticket.subject,
                    clientName: ticket.client
                        ?.name ??
                        undefined,
                    clientEmail: ticket.client
                        ?.email ??
                        '',
                    message: body.content,
                    appName: ticket.application
                        .name,
                });
            }
            catch (error) {
                console.error('Erreur email support', error);
            }
        }
        await this.prisma.notification.create({
            data: {
                userId: application.projectManagerId,
                ticketId,
                type: 'NEW_MESSAGE',
            },
        });
        if (ticket.assignedTo &&
            ticket.assignedTo !== application.projectManagerId) {
            await this.prisma.notification.create({
                data: {
                    userId: ticket.assignedTo,
                    ticketId,
                    type: 'NEW_MESSAGE',
                },
            });
        }
        return message;
    }
    async getActiveTicket(clientEmail, apiKey) {
        const application = await this.verifyApiKey(apiKey);
        const ticket = await this.prisma.ticket.findFirst({
            where: {
                applicationId: application.id,
                client: {
                    email: clientEmail,
                },
                status: {
                    in: ['OPEN', 'IN_PROGRESS'],
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (!ticket) {
            return {
                ticketId: null,
            };
        }
        const widgetToken = this.jwtService.sign({
            ticketId: ticket.id,
            clientEmail,
            role: 'CLIENT_WIDGET',
        }, {
            secret: 'secret123',
            expiresIn: '30d',
        });
        return {
            ticketId: ticket.id,
            widgetToken,
        };
    }
    async uploadFile(ticketId, file, clientEmail, apiKey) {
        const application = await this.verifyApiKey(apiKey);
        const ticket = await this.prisma.ticket.findFirst({
            where: {
                id: ticketId,
                applicationId: application.id,
                client: {
                    email: clientEmail,
                },
            },
            include: {
                application: {
                    include: {
                        projectManager: true,
                    },
                },
                assignedUser: true,
                client: true,
            },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket introuvable');
        }
        const message = await this.prisma.message.create({
            data: {
                ticketId,
                senderType: 'CLIENT',
                content: file.originalname,
                fileUrl: `/uploads/${file.filename}`,
                fileName: file.originalname,
            },
        });
        if (ticket.application
            ?.projectManager
            ?.email) {
            try {
                await this.mailService
                    .sendNewMessageEmail(ticket.application
                    .projectManager
                    .email, {
                    ticketId: ticket.id,
                    subject: ticket.subject,
                    clientName: ticket.client
                        ?.name ??
                        undefined,
                    clientEmail: ticket.client
                        ?.email ??
                        '',
                    message: `📎 Fichier envoyé : ${file.originalname}`,
                    appName: ticket.application
                        .name,
                });
            }
            catch (error) {
                console.error('Erreur email PM', error);
            }
        }
        if (ticket.assignedUser
            ?.email) {
            try {
                await this.mailService
                    .sendNewMessageEmail(ticket.assignedUser
                    .email, {
                    ticketId: ticket.id,
                    subject: ticket.subject,
                    clientName: ticket.client
                        ?.name ??
                        undefined,
                    clientEmail: ticket.client
                        ?.email ??
                        '',
                    message: `📎 Fichier envoyé : ${file.originalname}`,
                    appName: ticket.application
                        .name,
                });
            }
            catch (error) {
                console.error('Erreur email support', error);
            }
        }
        await this.prisma.notification.create({
            data: {
                userId: application.projectManagerId,
                ticketId,
                type: 'NEW_MESSAGE',
            },
        });
        if (ticket.assignedTo &&
            ticket.assignedTo !==
                application.projectManagerId) {
            await this.prisma.notification.create({
                data: {
                    userId: ticket.assignedTo,
                    ticketId,
                    type: 'NEW_MESSAGE',
                },
            });
        }
        return message;
    }
};
exports.WidgetService = WidgetService;
exports.WidgetService = WidgetService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService,
        jwt_1.JwtService,
        ticket_gateway_1.TicketGateway])
], WidgetService);
//# sourceMappingURL=widget.service.js.map