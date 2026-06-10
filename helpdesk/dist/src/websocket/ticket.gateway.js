"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const messages_service_1 = require("../messages/messages.service");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let TicketGateway = class TicketGateway {
    messagesService;
    jwtService;
    prismaService;
    mailService;
    server;
    constructor(messagesService, jwtService, prismaService, mailService) {
        this.messagesService = messagesService;
        this.jwtService = jwtService;
        this.prismaService = prismaService;
        this.mailService = mailService;
    }
    async handleJoin(ticketId, client) {
        console.log('JOIN TICKET', ticketId, 'socket:', client.id);
        client.join(`ticket:${ticketId}`);
        const rooms = Array.from(client.rooms);
        console.log('ROOMS après join:', rooms);
        const messages = await this.messagesService.findByTicket(ticketId);
        console.log('MESSAGES TROUVÉS:', messages.length);
        client.emit('messageHistory', messages);
    }
    handleLeave(ticketId, client) {
        client.leave(`ticket:${ticketId}`);
    }
    async handleMessage(data, client) {
        console.log('SEND MESSAGE reçu:', data.ticketId, data.content);
        try {
            const payload = this.jwtService.verify(data.token, { secret: 'secret123' });
            console.log('PAYLOAD:', payload);
            const message = await this.messagesService.createFromSocket(data.ticketId, payload.userId, payload.role, data.content);
            console.log('MESSAGE CRÉÉ:', message.id);
            const room = `ticket:${data.ticketId}`;
            const socketsInRoom = await this.server.in(room).fetchSockets();
            console.log('SOCKETS DANS LA ROOM:', socketsInRoom.length);
            this.server.to(room).emit('ticket:newMessage', message);
            console.log('ÉMIS vers', room);
        }
        catch (e) {
            console.log('ERREUR:', e.message);
            client.emit('error', { message: 'Non autorisé' });
        }
    }
    async handleJoinWidget(data, client) {
        client.join(`ticket:${data.ticketId}`);
        const messages = await this.messagesService.findByTicket(data.ticketId);
        client.emit('widgetMessageHistory', messages);
    }
    handleLeaveWidget(ticketId, client) {
        client.leave(`ticket:${ticketId}`);
    }
    async handleWidgetMessage(data, client) {
        try {
            const payload = this.jwtService.verify(data.token, {
                secret: 'secret123',
            });
            const message = await this.messagesService.createWidgetMessage(data.ticketId, payload.clientEmail, data.content);
            this.server
                .to(`ticket:${data.ticketId}`)
                .emit('ticket:newMessage', message);
        }
        catch (e) {
            client.emit('error', {
                message: 'Unauthorized',
            });
        }
    }
    async handleWidgetFile(data, client) {
        console.log('FILE EVENT HIT', data?.file?.name);
        try {
            const payload = this.jwtService.verify(data.token, {
                secret: 'secret123',
            });
            const clientEmail = payload.clientEmail;
            const ticket = await this.prismaService.ticket.findFirst({
                where: {
                    id: data.ticketId,
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
                client.emit('error', { message: 'Ticket non trouvé ou non autorisé' });
                return;
            }
            let base64Data = data.file.content;
            if (base64Data.indexOf(';base64,') !== -1) {
                base64Data = base64Data.split(';base64,').pop() || '';
            }
            const buffer = Buffer.from(base64Data, 'base64');
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = path.extname(data.file.name).toLowerCase();
            const filename = `${uniqueSuffix}${ext}`;
            const filepath = path.join('./uploads', filename);
            if (!fs.existsSync('./uploads')) {
                fs.mkdirSync('./uploads', { recursive: true });
            }
            fs.writeFileSync(filepath, buffer);
            const message = await this.prismaService.message.create({
                data: {
                    ticketId: data.ticketId,
                    senderId: ticket.clientId,
                    senderType: 'CLIENT',
                    content: data.file.name,
                    fileUrl: `/uploads/${filename}`,
                    fileName: data.file.name,
                    fileType: data.file.type,
                },
            });
            this.server
                .to(`ticket:${data.ticketId}`)
                .emit('ticket:newMessage', message);
            await this.prismaService.notification.create({
                data: {
                    userId: ticket.application.projectManagerId,
                    ticketId: ticket.id,
                    type: 'NEW_MESSAGE',
                },
            });
            if (ticket.assignedTo &&
                ticket.assignedTo !== ticket.application.projectManagerId) {
                await this.prismaService.notification.create({
                    data: {
                        userId: ticket.assignedTo,
                        ticketId: ticket.id,
                        type: 'NEW_MESSAGE',
                    },
                });
            }
            if (ticket.application?.projectManager?.email) {
                try {
                    await this.mailService.sendNewMessageEmail(ticket.application.projectManager.email, {
                        ticketId: ticket.id,
                        subject: ticket.subject,
                        clientName: ticket.client?.name ?? undefined,
                        clientEmail: ticket.client?.email ?? '',
                        message: `📎 Fichier envoyé : ${data.file.name}`,
                        appName: ticket.application.name,
                    });
                }
                catch (error) {
                    console.error('Erreur email PM:', error);
                }
            }
            if (ticket.assignedUser?.email) {
                try {
                    await this.mailService.sendNewMessageEmail(ticket.assignedUser.email, {
                        ticketId: ticket.id,
                        subject: ticket.subject,
                        clientName: ticket.client?.name ?? undefined,
                        clientEmail: ticket.client?.email ?? '',
                        message: `📎 Fichier envoyé : ${data.file.name}`,
                        appName: ticket.application.name,
                    });
                }
                catch (error) {
                    console.error('Erreur email support:', error);
                }
            }
        }
        catch (e) {
            console.error('Error during sendWidgetFile:', e.message);
            client.emit('error', { message: 'Failed to upload file' });
        }
    }
};
exports.TicketGateway = TicketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], TicketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinTicket'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], TicketGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveTicket'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TicketGateway.prototype, "handleLeave", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], TicketGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinWidgetTicket'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], TicketGateway.prototype, "handleJoinWidget", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveWidgetTicket'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TicketGateway.prototype, "handleLeaveWidget", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendWidgetMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], TicketGateway.prototype, "handleWidgetMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendWidgetFile'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], TicketGateway.prototype, "handleWidgetFile", null);
exports.TicketGateway = TicketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        maxHttpBufferSize: 1e7,
    }),
    __metadata("design:paramtypes", [messages_service_1.MessagesService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService,
        mail_service_1.MailService])
], TicketGateway);
//# sourceMappingURL=ticket.gateway.js.map