import { IsString, IsInt, IsOptional } from 'class-validator'

export class CreateTicketDto {
  subject: string
  priority: string
  issueTypeId: number
  status?: string
  // applicationId et clientId sont maintenant automatiques
}

// export class CreateTicketDto {
//   @IsString()
//   subject: string

//   @IsString()
//   status: string

//   @IsString()
//   priority: string

//   @IsInt()
//   applicationId: number

//   @IsInt()
//   clientId: number

//   @IsInt()
//   issueTypeId: number

//   @IsOptional()
//   @IsInt()
//   assignedTo?: number
// }

