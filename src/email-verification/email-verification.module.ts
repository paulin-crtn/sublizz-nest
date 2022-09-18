import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { EmailVerificationService } from './email-verification.service';

@Module({
  imports: [MailModule],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
