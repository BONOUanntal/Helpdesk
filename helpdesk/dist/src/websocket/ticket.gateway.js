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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const messages_service_1 = require("../messages/messages.service");
const jwt_1 = require("@nestjs/jwt");
let TicketGateway = class TicketGateway {
    messagesService;
    jwtService;
    server;
    constructor(messagesService, jwtService) {
        this.messagesService = messagesService;
        this.jwtService = jwtService;
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
exports.TicketGateway = TicketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
    }),
    __metadata("design:paramtypes", [messages_service_1.MessagesService,
        jwt_1.JwtService])
], TicketGateway);
//# sourceMappingURL=ticket.gateway.js.map