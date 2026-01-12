import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: 'Titlul este obligatoriu' })
  title: string;

  @IsNumber()
  type_id: number;

  @IsNumber()
  faculty_id: number;

  @IsDateString({}, { message: 'Data de început este invalidă' })
  date_start: string;

  @IsDateString({}, { message: 'Deadline-ul este invalid' })
  deadline: string;

  @IsString()
  @IsNotEmpty({ message: 'Locația este obligatorie' })
  location: string;

  @IsNumber()
  max_participants: number;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsString()
  @IsNotEmpty({ message: 'Descrierea este obligatorie' })
  description: string;
}
