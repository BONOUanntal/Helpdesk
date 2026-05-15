import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class IssueTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.issueType.findMany()
  }

  async create(data: { name: string; description?: string }) {
    return this.prisma.issueType.create({ data })
  }

  async remove(id: number) {
    return this.prisma.issueType.delete({ where: { id } })
  }
}