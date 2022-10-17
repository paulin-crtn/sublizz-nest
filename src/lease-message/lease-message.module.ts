import { Module } from '@nestjs/common';
import { LeaseMessageService } from './lease-message.service';
import { LeaseMessageController } from './lease-message.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [LeaseMessageService],
  controllers: [LeaseMessageController],
})
export class LeaseMessageModule {}
