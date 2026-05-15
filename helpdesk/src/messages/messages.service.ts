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

  async create(ticketId: number, senderId: number, senderType: string, content: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        client: true,
        application: { include: { projectManager: true } },
      },
    })
    if (!ticket) throw new NotFoundException('Ticket introuvable')

    // Crée le message
    const message = await this.prisma.message.create({
      data: { ticketId, senderId, senderType, content },
      include: { attachments: true },
    })

    // Détermine qui notifier
    // Si c'est le client qui envoie → notifie le PM et le support assigné
    // Si c'est le PM ou support qui envoie → notifie le client via son User
    if (senderType === 'CLIENT') {
      // Notifie le PM
      await this.prisma.notification.create({
        data: {
          userId: ticket.application.projectManagerId,
          ticketId,
          type: 'NEW_MESSAGE',
        },
      })

      // Notifie le support assigné si différent du PM
      if (ticket.assignedTo && ticket.assignedTo !== ticket.application.projectManagerId) {
        await this.prisma.notification.create({
          data: {
            userId: ticket.assignedTo,
            ticketId,
            type: 'NEW_MESSAGE',
          },
        })
      }
    } else {
      // PM ou support répond → notifie le client
      // On retrouve le User correspondant au Client via l'email
      if (ticket.client.email) {
        const clientUser = await this.prisma.user.findFirst({
          where: { email: ticket.client.email },
        })
        if (clientUser) {
          await this.prisma.notification.create({
            data: {
              userId: clientUser.id,
              ticketId,
              type: 'NEW_MESSAGE',
            },
          })
        }
      }
    }

    return message
  }
}