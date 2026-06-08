import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'
import { MailService } from '../mail/mail.service'
import { JwtService } from '@nestjs/jwt'
import { TicketGateway } from '../websocket/ticket.gateway'

@Injectable()
export class WidgetService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private jwtService: JwtService,
    private ticketGateway: TicketGateway,
  ) {}


  private async verifyApiKey(apiKey: string) {
      const application =
        await this.prisma.application.findUnique({
          where: { apiKey },

          include: {
            projectManager: true,
          },
        })

      if (!application) {
        throw new UnauthorizedException(
          'API key invalide',
        )
      }

      return application
  }

  async recoverToken(
    ticketId: number,
    clientEmail: string,
    apiKey: string,
  ) {
    const ticket =
      await this.prisma.ticket.findFirst({
        where: {
          id: ticketId,

          client: {
            email: clientEmail,
          },

          application: {
            apiKey: apiKey,
          },
        },
      })

    if (!ticket) {
      throw new UnauthorizedException(
        'Ticket introuvable',
      )
    }

    const token = this.jwtService.sign(
      {
        ticketId,
        clientEmail,
      },
      {
        secret: 'secret123',
        expiresIn: '30d',
      },
    )

    return { token }
  }


  private async findOrCreateClient(
    email: string,
    name: string,
    applicationId: number,
  ) {
    let client = await this.prisma.client.findFirst({
      where: {
        email,
        applicationId,
      },
    })

    if (!client) {
      client = await this.prisma.client.create({
        data: {
          externalId: `widget-${Date.now()}`,
          email,
          name: name || email,
          applicationId,
        },
      })
    }

    return client
  }

  async createTicket(data: {
    apiKey: string
    subject: string
    priority: string
    issueTypeId: number
    clientEmail: string
    clientName?: string
  }) {

    const application =
    await this.verifyApiKey(
      data.apiKey,
    )

    const client = await this.findOrCreateClient(
      data.clientEmail,
      data.clientName ?? data.clientEmail,
      application.id,
    )

    const issueType = await this.prisma.issueType.findUnique({
      where: {
        id: data.issueTypeId,
      },
    })

    if (!issueType) {
      throw new NotFoundException('Type de problème introuvable')
    }

    // ✅ Création TOUJOURS d’un nouveau ticket
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
    })

    // Notification PM
    await this.prisma.notification.create({
      data: {
        userId: application.projectManagerId,
        ticketId: ticket.id,
        type: 'NEW_TICKET',
      },
    })

    if (application.projectManager?.email) {
      try {
        await this.mailService.sendNewTicketEmail(
          application.projectManager.email,
          {
            ticketId: ticket.id,
            subject: ticket.subject,
            clientEmail: client.email ?? '',
            clientName: client.name ?? undefined,
            priority: ticket.priority,
            appName: application.name,
          },
        )

        console.log(
          '✅ Email envoyé au PM',
        )
      } catch (error) {
        console.error(
          '❌ Erreur email PM:',
          error,
        )
      }
    }

    const widgetToken = this.jwtService.sign(
      {
        ticketId: ticket.id,
        clientEmail: client.email,
        role: 'CLIENT_WIDGET',
      },
      {
        secret: 'secret123',
        expiresIn: '30d',
      },
    )

    return {
      success: true,
      ticketId: ticket.id,
      widgetToken,
    }
  }

  async getIssueTypes() {
    // Tri alphabétique
    return this.prisma.issueType.findMany({
      orderBy: {
        name: 'asc',
      },
    })
  }

  async getMessages(
    ticketId: number,
    clientEmail: string,
    apiKey: string,
  ) {
    const application = await this.verifyApiKey(apiKey)

    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id: ticketId,
        applicationId: application.id,

        client: {
          email: clientEmail,
        },
      },
    })

    if (!ticket) {
      throw new NotFoundException('Ticket introuvable')
    }

    return this.prisma.message.findMany({
      where: {
        ticketId,
      },

      orderBy: {
        createdAt: 'asc',
      },
    })
  }

  async sendMessage(
    ticketId: number,
    body: {
      clientEmail: string
      apiKey: string
      content: string
    },
  ) {
    const application = await this.verifyApiKey(body.apiKey)

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
    })

    if (!ticket) {
      throw new NotFoundException('Ticket introuvable')
    }

    const client = await this.prisma.client.findFirst({
      where: {
        email: body.clientEmail,
        applicationId: application.id,
      },
    })

    const message = await this.prisma.message.create({
      data: {
        ticketId,
        senderId: client?.id ?? null,
        senderType: 'CLIENT',
        content: body.content,
      },
    })

    // Émet via socket à tous dans la room du ticket
    this.ticketGateway.server
      .to(`ticket:${ticketId}`)
      .emit('ticket:newMessage', message)

    // Email PM
    if (
      ticket.application
        ?.projectManager
        ?.email
    ) {
      try {
        await this.mailService
          .sendNewMessageEmail(
            ticket.application
              .projectManager
              .email,
            {
              ticketId: ticket.id,
              subject:
                ticket.subject,

              clientName:
                ticket.client
                  ?.name ??
                undefined,

              clientEmail:
                ticket.client
                  ?.email ??
                '',

              message:
                body.content,

              appName:
                ticket.application
                  .name,
            },
          )
      } catch (error) {
        console.error(
          'Erreur email PM',
          error,
        )
      }
    }

    // Email support assigné
    if (
      ticket.assignedUser
        ?.email
    ) {
      try {
        await this.mailService
          .sendNewMessageEmail(
            ticket.assignedUser
              .email,
            {
              ticketId: ticket.id,
              subject:
                ticket.subject,

              clientName:
                ticket.client
                  ?.name ??
                undefined,

              clientEmail:
                ticket.client
                  ?.email ??
                '',

              message:
                body.content,

              appName:
                ticket.application
                  .name,
            },
          )
      } catch (error) {
        console.error(
          'Erreur email support',
          error,
        )
      }
    }

    // ✅ Notification PM
    await this.prisma.notification.create({
      data: {
        userId: application.projectManagerId,
        ticketId,
        type: 'NEW_MESSAGE',
      },
    })

    // ✅ Notification support assigné
    if (
      ticket.assignedTo &&
      ticket.assignedTo !== application.projectManagerId
    ) {
      await this.prisma.notification.create({
        data: {
          userId: ticket.assignedTo,
          ticketId,
          type: 'NEW_MESSAGE',
        },
      })
    }

    return message
  }

  async getActiveTicket(clientEmail: string, apiKey: string) {
    const application = await this.verifyApiKey(apiKey)

    // ✅ On récupère juste le dernier ticket ouvert
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
    })

    // ✅ Aucun ticket actif
    if (!ticket) {
      return {
        ticketId: null,
      }
    }

    const widgetToken =
      this.jwtService.sign(
        {
          ticketId: ticket.id,
          clientEmail,
          role: 'CLIENT_WIDGET',
        },
        {
          secret: 'secret123',
          expiresIn: '30d',
        },
      )

    return {
      ticketId: ticket.id,
      widgetToken,
    }
  }

  async uploadFile(
    ticketId: number,
    file: Express.Multer.File,
    clientEmail: string,
    apiKey: string,
  ) {
    const application =
      await this.verifyApiKey(apiKey)

    const ticket =
      await this.prisma.ticket.findFirst({
        where: {
          id: ticketId,
          applicationId:
            application.id,
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
      })

    if (!ticket) {
      throw new NotFoundException(
        'Ticket introuvable',
      )
    }

    const message =
      await this.prisma.message.create({
        data: {
          ticketId,
          senderType: 'CLIENT',
          content:
            file.originalname,
          fileUrl:
            `/uploads/${file.filename}`,
          fileName:
            file.originalname,
        },
      })
    
    // Email PM
    if (
      ticket.application
        ?.projectManager
        ?.email
    ) {
      try {
        await this.mailService
          .sendNewMessageEmail(
            ticket.application
              .projectManager
              .email,
            {
              ticketId: ticket.id,
              subject:
                ticket.subject,

              clientName:
                ticket.client
                  ?.name ??
                undefined,

              clientEmail:
                ticket.client
                  ?.email ??
                '',

              message:
                `📎 Fichier envoyé : ${file.originalname}`,

              appName:
                ticket.application
                  .name,
            },
          )
      } catch (error) {
        console.error(
          'Erreur email PM',
          error,
        )
      }
    }

    // Email support assigné
    if (
      ticket.assignedUser
        ?.email
    ) {
      try {
        await this.mailService
          .sendNewMessageEmail(
            ticket.assignedUser
              .email,
            {
              ticketId: ticket.id,
              subject:
                ticket.subject,

              clientName:
                ticket.client
                  ?.name ??
                undefined,

              clientEmail:
                ticket.client
                  ?.email ??
                '',

              message:
                `📎 Fichier envoyé : ${file.originalname}`,

              appName:
                ticket.application
                  .name,
            },
          )
      } catch (error) {
        console.error(
          'Erreur email support',
          error,
        )
      }
    }

    // Notification PM
    await this.prisma.notification.create({
      data: {
        userId:
          application.projectManagerId,
        ticketId,
        type: 'NEW_MESSAGE',
      },
    })

    // Notification support assigné
    if (
      ticket.assignedTo &&
      ticket.assignedTo !==
        application.projectManagerId
    ) {
      await this.prisma.notification.create({
        data: {
          userId:
            ticket.assignedTo,
          ticketId,
          type: 'NEW_MESSAGE',
        },
      })
    }
    return message
  }
}