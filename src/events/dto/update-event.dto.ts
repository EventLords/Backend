import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsNumber,
} from 'class-validator';
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
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  max_participants?: number | string;

  @IsOptional()
  faculty_id?: number | string;

  @IsOptional()
  type_id?: number | string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}
