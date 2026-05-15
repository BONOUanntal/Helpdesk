import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}
  
  async create(data: CreateTicketDto, userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })
    if (!user) throw new NotFoundException('Utilisateur introuvable')

    const client = await this.prisma.client.findFirst({
      where: { email: user.email },
      include: { application: true },
    })
    if (!client) throw new NotFoundException('Profil client introuvable')

    // Crée le ticket
    const ticket = await this.prisma.ticket.create({
      data: {
        subject: data.subject,
        status: data.status ?? 'OPEN',
        priority: data.priority,
        issueType: { connect: { id: data.issueTypeId } },
        application: { connect: { id: client.applicationId } },
        client: { connect: { id: client.id } },
      },
    })

    // Notifie le PM de l'application
    await this.prisma.notification.create({
      data: {
        userId: client.application.projectManagerId,
        ticketId: ticket.id,
        type: 'NEW_TICKET',
      },
    })

    return ticket
  }

  async assign(ticketId: number, supportId: number, requesterId: number) {
    // Vérifie que le ticket appartient à une app du PM
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id: ticketId,
        application: { projectManagerId: requesterId },
      },
    })
    if (!ticket) throw new NotFoundException('Ticket introuvable ou non autorisé')

    // Assigne le ticket
    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { assignedTo: supportId },
    })

    // Notifie le support assigné
    await this.prisma.notification.create({
      data: {
        userId: supportId,
        ticketId: ticket.id,
        type: 'NEW_TICKET',
      },
    })

    return updated
  }

  async findOne(id: number, userId: number) {
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id,
        assignedTo: userId,
      },
      include: {
        application: true,
        client: true,
        issueType: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async update(id: number, data: UpdateTicketDto, userId: number, role: string) {
    let ticket;

    if (role === 'ADMIN') {
      ticket = await this.prisma.ticket.findFirst({ where: { id } })
    } else if (role === 'PROJECT_MANAGER') {
      ticket = await this.prisma.ticket.findFirst({
        where: {
          id,
          application: { projectManagerId: userId },
        },
      })
    } else {
      // SUPPORT — doit être assigné au ticket
      ticket = await this.prisma.ticket.findFirst({
        where: { id, assignedTo: userId },
      })
    }

    if (!ticket) throw new NotFoundException('Ticket not found')

    return this.prisma.ticket.update({
      where: { id },
      data: {
        ...(data.subject !== undefined && { subject: data.subject }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.priority !== undefined && { priority: data.priority }),
      },
    })
  }

  async remove(id: number, userId: number) {
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id,
        assignedTo: userId,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return this.prisma.ticket.delete({
      where: { id },
    });
  }

  async findAll(userId: number, role: string, clientId?: number) {

    const include = {
      application: true,
      client: true,
      issueType: true,        // ← déjà présent mais à vérifier partout
      assignedUser: {
        select: { id: true, name: true, email: true }
      },
    }

    if (role === 'ADMIN') {
      return this.prisma.ticket.findMany({ include })
    }

    if (role === 'CLIENT') {
      return this.prisma.ticket.findMany({
        where: { clientId },
        include,
      })
    }

    if (role === 'SUPPORT') {
      return this.prisma.ticket.findMany({
        where: { assignedTo: userId },
        include,
      })
    }

    if (role === 'PROJECT_MANAGER') {
      return this.prisma.ticket.findMany({
        where: { application: { projectManagerId: userId } },
        include,
      })
    }

    return []
  }
}