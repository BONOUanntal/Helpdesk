import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common'

import { TicketsService } from './tickets.service'
import { CreateTicketDto } from './dto/create-ticket.dto'
import { UpdateTicketDto } from './dto/update-ticket.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'

@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: CreateTicketDto, @Req() req: any) {
    return this.ticketsService.create(body, req.user.userId)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: any) {
    return this.ticketsService.findAll(
      req.user.userId,
      req.user.role,
      req.user.clientId,
    )
  }


  @Roles('ADMIN', 'PROJECT_MANAGER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/assign')
  assignTicket(
    @Param('id') id: string,
    @Body('supportId') supportId: number,
    @Req() req: any,
  ) {
    return this.ticketsService.assign(
      Number(id),
      supportId,
      req.user.userId,
      req.user.role,
    )
  }



  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.ticketsService.findOne(Number(id), req.user.userId)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() body: UpdateTicketDto,
    @Req() req: any,
  ) {
    return this.ticketsService.update(
      Number(id),
      body,
      req.user.userId,
      req.user.role,
    )
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.ticketsService.remove(
      Number(id),
      req.user.userId,
    )
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/all')
  findEverything(@Req() req: any) {
    return this.ticketsService.findAll(
      req.user.userId,
      req.user.role,
      req.user.clientId,
    )
  }
}