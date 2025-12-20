import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { EventStatus } from '@prisma/client';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  date_start?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsString()
  location?: string;
}
