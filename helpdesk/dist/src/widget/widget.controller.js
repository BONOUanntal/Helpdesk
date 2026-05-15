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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetController = void 0;
const common_1 = require("@nestjs/common");
const widget_service_1 = require("./widget.service");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
let WidgetController = class WidgetController {
    widgetService;
    constructor(widgetService) {
        this.widgetService = widgetService;
    }
    createTicket(body) {
        return this.widgetService.createTicket(body);
    }
    getIssueTypes() {
        return this.widgetService.getIssueTypes();
    }
    getMessages(ticketId, clientEmail, apiKey) {
        return this.widgetService.getMessages(Number(ticketId), clientEmail, apiKey);
    }
    sendMessage(ticketId, body) {
        return this.widgetService.sendMessage(Number(ticketId), body);
    }
    getActiveTicket(clientEmail, apiKey) {
        return this.widgetService.getActiveTicket(clientEmail, apiKey);
    }
    uploadFile(ticketId, file, body) {
        return this.widgetService.uploadFile(Number(ticketId), file, body);
    }
};
exports.WidgetController = WidgetController;
__decorate([
    (0, common_1.Post)('ticket'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WidgetController.prototype, "createTicket", null);
__decorate([
    (0, common_1.Get)('issue-types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WidgetController.prototype, "getIssueTypes", null);
__decorate([
    (0, common_1.Get)('ticket/:ticketId/messages'),
    __param(0, (0, common_1.Param)('ticketId')),
    __param(1, (0, common_1.Query)('clientEmail')),
    __param(2, (0, common_1.Query)('apiKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], WidgetController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('ticket/:ticketId/messages'),
    __param(0, (0, common_1.Param)('ticketId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WidgetController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('ticket/active'),
    __param(0, (0, common_1.Query)('clientEmail')),
    __param(1, (0, common_1.Query)('apiKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WidgetController.prototype, "getActiveTicket", null);
__decorate([
    (0, common_1.Post)('tickets/:ticketId/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const unique = `${Date.now()}-${file.originalname}`;
                cb(null, unique);
            },
        }),
    })),
    __param(0, (0, common_1.Param)('ticketId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof Express !== "undefined" && (_a = Express.Multer) !== void 0 && _a.File) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", void 0)
], WidgetController.prototype, "uploadFile", null);
exports.WidgetController = WidgetController = __decorate([
    (0, common_1.Controller)('widget'),
    __metadata("design:paramtypes", [widget_service_1.WidgetService])
], WidgetController);
//# sourceMappingURL=widget.controller.js.map