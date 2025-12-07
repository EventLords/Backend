import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterStudentDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  // Licență / Master / Doctorat etc.
  @IsString()
  @IsNotEmpty()
  studyCycle: string;

  @IsInt()
  facultyId: number;

  @IsInt()
  specializationId: number;

  @IsInt()
  @IsOptional()
  studyYear?: number;
}
