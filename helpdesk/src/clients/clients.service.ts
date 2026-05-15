import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.findMany({
      include: { application: { select: { id: true, name: true } } },
    })
  }

  async findOne(id: number) {
    return this.prisma.client.findUnique({
      where: { id },
      include: { application: true },
    })
  }
}