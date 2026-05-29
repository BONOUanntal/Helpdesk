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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let MailService = class MailService {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env
                .GMAIL_APP_PASSWORD,
        },
    });
    async sendNewTicketEmail(to, data) {
        await this.transporter.sendMail({
            from: process.env.GMAIL_USER,
            to,
            subject: `Nouveau ticket #${data.ticketId}`,
            html: `
        <h2>
          Nouveau ticket reçu
        </h2>

        <p>
          Un client a créé
          un ticket sur votre
          application.
        </p>

        <ul>
          <li>
            <strong>ID :</strong>
            #${data.ticketId}
          </li>

          <li>
            <strong>Sujet :</strong>
            ${data.subject}
          </li>

          <li>
            <strong>Client :</strong>
            ${data.clientName ||
                '—'}
          </li>

          <li>
            <strong>Email :</strong>
            ${data.clientEmail}
          </li>

          <li>
            <strong>Priorité :</strong>
            ${data.priority}
          </li>

          <li>
            <strong>Application :</strong>
            ${data.appName}
          </li>
        </ul>
      `,
        });
    }
    async sendNewMessageEmail(to, data) {
        await this.transporter.sendMail({
            from: process.env.GMAIL_USER,
            to,
            subject: `Nouveau message ticket #${data.ticketId}`,
            html: `
        <h2>
          Nouveau message client
        </h2>

        <p>
          Un client a répondu
          au ticket.
        </p>

        <ul>
          <li>
            <strong>Ticket :</strong>
            #${data.ticketId}
          </li>

          <li>
            <strong>Sujet :</strong>
            ${data.subject}
          </li>

          <li>
            <strong>Client :</strong>
            ${data.clientName ||
                '—'}
          </li>

          <li>
            <strong>Email :</strong>
            ${data.clientEmail}
          </li>

          <li>
            <strong>Application :</strong>
            ${data.appName}
          </li>
        </ul>

        <p>
          <strong>
            Message :
          </strong>
        </p>

        <blockquote>
          ${data.message}
        </blockquote>
      `,
        });
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)()
], MailService);
//# sourceMappingURL=mail.service.js.map