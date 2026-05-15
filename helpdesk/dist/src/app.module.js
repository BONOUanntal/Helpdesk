"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const tickets_module_1 = require("./tickets/tickets.module");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const applications_module_1 = require("./applications/applications.module");
const clients_module_1 = require("./clients/clients.module");
const messages_module_1 = require("./messages/messages.module");
const issue_types_module_1 = require("./issue-types/issue-types.module");
const notifications_module_1 = require("./notifications/notifications.module");
const widget_module_1 = require("./widget/widget.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [tickets_module_1.TicketsModule, prisma_module_1.PrismaModule, auth_module_1.AuthModule,
            users_module_1.UsersModule, applications_module_1.ApplicationsModule, clients_module_1.ClientsModule,
            messages_module_1.MessagesModule, issue_types_module_1.IssueTypesModule, notifications_module_1.NotificationsModule, widget_module_1.WidgetModule],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map