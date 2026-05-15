import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.application.findMany({
      include: { projectManager: { select: { id: true, name: true, email: true } } },
    })
  }

  async findOne(id: number) {
    return this.prisma.application.findUnique({
      where: { id },
      include: { projectManager: { select: { id: true, name: true, email: true } } },
    })
  }

  async create(data: { name: string; projectManagerId: number }) {
    const apiKey = crypto.randomUUID()
    return this.prisma.application.create({
      data: { name: data.name, projectManagerId: data.projectManagerId, apiKey },
    })
  }

  async remove(id: number) {
    return this.prisma.application.delete({ where: { id } })
  }
}