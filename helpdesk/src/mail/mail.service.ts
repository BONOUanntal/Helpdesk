import { Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
  private transporter =
    nodemailer.createTransport({
      service: 'gmail',

      auth: {
        user:
          process.env.GMAIL_USER,

        pass:
          process.env
            .GMAIL_APP_PASSWORD,
      },
    })

  async sendNewTicketEmail(
    to: string,
    data: {
      ticketId: number
      subject: string
      clientEmail: string
      clientName?: string
      priority: string
      appName: string
    },
  ) {
    await this.transporter.sendMail({
      from:
        process.env.GMAIL_USER,

      to,

      subject:
        `🎫 Nouveau ticket #${data.ticketId}`,

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
            ${
              data.clientName ||
              '—'
            }
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
    })
  }

  async sendNewMessageEmail(
    to: string,
    data: {
      ticketId: number
      subject: string
      clientName?: string
      clientEmail: string
      message: string
      appName: string
    },
  ) {
    await this.transporter.sendMail({
      from:
        process.env.GMAIL_USER,

      to,

      subject:
        `💬 Nouveau message ticket #${data.ticketId}`,

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
            ${
              data.clientName ||
              '—'
            }
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
    })
  }
}