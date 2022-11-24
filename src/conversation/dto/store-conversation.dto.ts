import { Type } from 'class-transformer';
import { IsNumber, IsString, MaxLength } from 'class-validator';

export class StoreConversationDto {
  @Type(() => Number)
  @IsNumber()
  leaseId: number;

  @IsString()
  @MaxLength(2000)
  message: string;
}
