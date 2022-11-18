import { Module } from '@nestjs/common';
import { ConversationMessageService } from './conversation-message.service';
import { ConversationMessageController } from './conversation-message.controller';

@Module({
  providers: [ConversationMessageService],
  controllers: [ConversationMessageController],
})
export class ConversationMessageModule {}
