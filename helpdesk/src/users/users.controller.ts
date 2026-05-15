import { Controller, Get, Patch, Delete, Param, Body, UseGuards, Post } from '@nestjs/common'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(Number(id))
  }

  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.usersService.updateRole(Number(id), body.role)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(Number(id))
  }

  @Post(':id/roles')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  addRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.usersService.addRole(Number(id), body.role)
  }

  @Delete(':id/roles/:role')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  removeRole(@Param('id') id: string, @Param('role') role: string) {
    return this.usersService.removeRole(Number(id), role)
  }
}