import { Module } from '@nestjs/common';
import { HelpUsService } from './help-us.service';
import { HelpUsController } from './help-us.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [HelpUsService],
  controllers: [HelpUsController],
})
export class HelpUsModule {}
