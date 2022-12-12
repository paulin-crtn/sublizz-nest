import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { ConversationMessageService } from '../conversation-message/conversation-message.service';
import { MailService } from '../mail/mail.service';

@Module({
  providers: [ConversationService, ConversationMessageService, MailService],
  controllers: [ConversationController],
})
export class ConversationModule {}
