import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsNumber()
  facultyId?: number;

  @IsOptional()
  @IsNumber()
  specializationId?: number;

  @IsOptional()
  @IsString()
  studyCycle?: string;

  @IsOptional()
  @IsNumber()
  studyYear?: number;
}
