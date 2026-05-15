import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { ClientsService } from './clients.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  findAll() {
    return this.clientsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(Number(id))
  }
}