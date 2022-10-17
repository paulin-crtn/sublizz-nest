import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class LeaseMessageDto {
  @Type(() => Number)
  @IsNumber()
  leaseId: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}
