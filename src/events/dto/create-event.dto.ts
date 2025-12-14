import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  type_id: number;

  @IsNumber()
  faculty_id: number;

  @IsDateString()
  date_start: string;

  @IsDateString()
  deadline: string;

  @IsString()
  location: string;

  @IsNumber()
  max_participants: number;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
