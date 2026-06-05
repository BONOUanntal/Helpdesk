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
        client.join(`ticket:${ticketId}`);
        const messages = await this.messagesService.findByTicket(ticketId);
        client.emit('messageHistory', messages);
    }
    handleLeave(ticketId, client) {
        client.leave(`ticket:${ticketId}`);
    }
    async handleMessage(data, client) {
        try {
            const payload = this.jwtService.verify(data.token, {
                secret: 'secret123',
            });
            const message = await this.messagesService.createFromSocket(data.ticketId, payload.userId, payload.role, data.content);
            this.server.to(`ticket:${data.ticketId}`).emit('newMessage', message);
        }
        catch (e) {
            console.log('JWT ERROR:', e.message);
            client.emit('error', { message: 'Non autorisé' });
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
exports.TicketGateway = TicketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' } }),
    __metadata("design:paramtypes", [messages_service_1.MessagesService,
        jwt_1.JwtService])
], TicketGateway);
//# sourceMappingURL=ticket.gateway.js.map