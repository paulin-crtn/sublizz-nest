import { Type } from 'class-transformer';
import { IsNumber, IsString, Length, MaxLength } from 'class-validator';

export class StoreConversationMessageDto {
  @IsString()
  @Length(12)
  conversationId: string;

  @Type(() => Number)
  @IsNumber()
  leaseId: number;

  @Type(() => Number)
  @IsNumber()
  toUserId: number;

  @IsString()
  @MaxLength(2000)
  message: string;
}
