import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async findByTicket(ticketId: number) {
    return this.prisma.message.findMany({
      where: { ticketId },
      include: { attachments: true },
      orderBy: { createdAt: 'asc' },
    })
  }

  async createWidgetMessage(
    ticketId: number,
    clientEmail: string,
    content: string,
  ) {
    const ticket =
      await this.prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          client: true,
          application: {
            include: {
              projectManager: true,
            },
          },
        },
      })

    if (!ticket) {
      throw new Error('Ticket introuvable')
    }

    const client =
      await this.prisma.client.findFirst({
        where: {
          email: clientEmail,
          applicationId:
            ticket.applicationId,
        },
      })

    const message =
      await this.prisma.message.create({
        data: {
          ticketId,
          senderId: client?.id ?? null,
          senderType: 'CLIENT',
          content,
        },
      })

    await this.prisma.notification.create({
      data: {
        userId:
          ticket.application.projectManagerId,
        ticketId,
        type: 'NEW_MESSAGE',
      },
    })

    return message
  }

  async createFromSocket(
    ticketId: number,
    senderId: number,
    senderType: string,
    content: string,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        client: true,
        application: { include: { projectManager: true } },
      },
    })
    if (!ticket) throw new Error('Ticket introuvable')

    const message = await this.prisma.message.create({
      data: { ticketId, senderId, senderType, content },
      include: { attachments: true },
    })

    if (senderType === 'CLIENT') {
      await this.prisma.notification.create({
        data: {
          userId: ticket.application.projectManagerId,
          ticketId,
          type: 'NEW_MESSAGE',
        },
      })
      if (ticket.assignedTo && ticket.assignedTo !== ticket.application.projectManagerId) {
        await this.prisma.notification.create({
          data: { userId: ticket.assignedTo, ticketId, type: 'NEW_MESSAGE' },
        })
      }
    } else {
      if (ticket.client.email) {
        const clientUser = await this.prisma.user.findFirst({
          where: { email: ticket.client.email },
        })
        if (clientUser) {
          await this.prisma.notification.create({
            data: { userId: clientUser.id, ticketId, type: 'NEW_MESSAGE' },
          })
        }
      }
    }

    return message
  }

  // Garde create pour compatibilité avec le controller HTTP
  async create(ticketId: number, senderId: number, senderType: string, content: string) {
    return this.createFromSocket(ticketId, senderId, senderType, content)
  }
}