import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { ApplicationsService } from './applications.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Get()
  findAll() {
    return this.applicationsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(Number(id))
  }

  @Post()
  create(@Body() body: { name: string; projectManagerId: number }) {
    return this.applicationsService.create(body)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(Number(id))
  }
}