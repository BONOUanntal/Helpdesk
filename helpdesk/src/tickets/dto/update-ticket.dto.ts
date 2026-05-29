import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator'

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  subject?: string

  @IsOptional()
  @IsString()
  priority?: string

  @IsOptional()
  @IsEnum([
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED',
  ])
  status?: string
}