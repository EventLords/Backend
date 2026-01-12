import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterStudentDto {
  @IsString({ message: 'Prenumele trebuie să fie text' })
  @IsNotEmpty({ message: 'Prenumele este obligatoriu' })
  firstName: string;

  @IsString({ message: 'Numele trebuie să fie text' })
  @IsNotEmpty({ message: 'Numele este obligatoriu' })
  lastName: string;

  @IsEmail({}, { message: 'Email invalid' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Parola trebuie să aibă minim 6 caractere' })
  password: string;

  @IsString({ message: 'Ciclul de studiu este obligatoriu' })
  @IsNotEmpty({ message: 'Ciclul de studiu este obligatoriu' })
  studyCycle: string;

  @Type(() => Number)
  @IsInt({ message: 'facultyId trebuie să fie număr întreg' })
  facultyId: number;

  @Type(() => Number)
  @IsInt({ message: 'specializationId trebuie să fie număr întreg' })
  specializationId: number;

  @Type(() => Number)
  @IsInt({ message: 'Anul de studiu trebuie să fie număr' })
  @Min(1, { message: 'Anul de studiu minim este 1' })
  @Max(6, { message: 'Anul de studiu maxim este 6' })
  @IsOptional()
  studyYear?: number;
}
