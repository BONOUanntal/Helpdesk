import { Module } from '@nestjs/common'
import { IssueTypesController } from './issue-types.controller'
import { IssueTypesService } from './issue-types.service'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [IssueTypesController],
  providers: [IssueTypesService],
})
export class IssueTypesModule {}