import { Module } from '@nestjs/common';
import { ConversationMessageService } from './conversation-message.service';
import { ConversationMessageController } from './conversation-message.controller';
import { MailService } from '../mail/mail.service';

@Module({
  providers: [ConversationMessageService, MailService],
  controllers: [ConversationMessageController],
})
export class ConversationMessageModule {}
