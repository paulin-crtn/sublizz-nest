import { IsString, MaxLength } from 'class-validator';

export class HelpUsDto {
  @IsString()
  @MaxLength(2000)
  message: string;
}
