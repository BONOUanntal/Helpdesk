import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { IssueTypesService } from './issue-types.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@Controller('issue-types')
@UseGuards(JwtAuthGuard)
export class IssueTypesController {
  constructor(private issueTypesService: IssueTypesService) {}

  @Get()
  findAll() {
    return this.issueTypesService.findAll()
  }

  @Post()
  create(@Body() body: { name: string; description?: string }) {
    return this.issueTypesService.create(body)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.issueTypesService.remove(Number(id))
  }
}