import { IsString, Length, MaxLength } from 'class-validator';

export class StoreConversationMessageDto {
  @IsString()
  @Length(12)
  conversationId: string;

  @IsString()
  @MaxLength(2000)
  message: string;
}
