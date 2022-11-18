import { Type } from 'class-transformer';
import { IsNumber, IsString, Length, MaxLength } from 'class-validator';

export class StoreConversationDto {
  @Type(() => Number)
  @IsNumber()
  leaseId: number;
}
