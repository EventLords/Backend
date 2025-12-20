import {
  IsOptional,
  IsString,
  IsNumberString,
  IsDateString,
} from 'class-validator';

export class EventFilterDto {
  @IsOptional()
  @IsNumberString()
  facultyId?: string;

  @IsOptional()
  @IsNumberString()
  typeId?: string;

  @IsOptional()
  @IsNumberString()
  organizerId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
