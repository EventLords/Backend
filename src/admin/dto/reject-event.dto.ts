import { IsNotEmpty, IsString } from 'class-validator';

export class RejectEventDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}
