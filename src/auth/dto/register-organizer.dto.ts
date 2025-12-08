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
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  organizationType: string; // Tip organizație

  @IsOptional()
  @IsString()
  organizationName?: string; // Numele organizației (opțional)

  @IsString()
  @IsNotEmpty()
  organizationDescription: string; // Descriere și motivul solicitării
}
