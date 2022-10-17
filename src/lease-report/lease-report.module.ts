import { Module } from '@nestjs/common';
import { LeaseReportService } from './lease-report.service';
import { LeaseReportController } from './lease-report.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [LeaseReportService],
  controllers: [LeaseReportController],
})
export class LeaseReportModule {}
