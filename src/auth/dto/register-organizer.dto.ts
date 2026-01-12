import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterOrganizerDto {
  @IsString()
  @IsNotEmpty()
  firstName: string; // Nume responsabil

  @IsString()
  @IsNotEmpty()
  lastName: string; // Prenume responsabil

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  phone: string;

  @IsString()
  @IsNotEmpty()
  organizationType: string;

  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsString()
  @IsNotEmpty()
  organizationDescription: string;
}
