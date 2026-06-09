import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

const ALLOWED_ROLES = ['ADMIN', 'PROJECT_MANAGER', 'SUPPORT']
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        additionalRoles: true,
      },
    })
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })
  }

  async updateRole(id: number, role: string) {
    return this.prisma.user.update({
      where: { id },
      data: { role: role as any },
    })
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } })
  }

  async addRole(userId: number, role: string) {
    const normalizedRole = role.toUpperCase()

    if (!ALLOWED_ROLES.includes(normalizedRole)) {
      throw new Error(`Rôle invalide: ${role}`)
    }

    return this.prisma.userRoleAssignment.create({
      data: {
        userId,
        role: normalizedRole as any,
      },
    })
  }

  async removeRole(userId: number, role: string) {
    return this.prisma.userRoleAssignment.deleteMany({
      where: { userId, role: role as any },
    })
  }
}