import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findForUser(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      include: { ticket: { select: { id: true, subject: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async markAsRead(id: number, userId: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
  }

  async countUnread(userId: number) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    })
  }
}