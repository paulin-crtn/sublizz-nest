import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class LeaseReportDto {
  @Type(() => Number)
  @IsNumber()
  leaseId: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;
}
