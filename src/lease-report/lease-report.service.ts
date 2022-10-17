/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { LeaseReportDto } from './dto';

/* -------------------------------------------------------------------------- */
/*                            LEASE REPORT SERVICE                            */
/* -------------------------------------------------------------------------- */
@Injectable()
export class LeaseReportService {
  constructor(private mailService: MailService) {}
  /* -------------------------------------------------------------------------- */
  /*                              PUBLIC FUNCTIONS                              */
  /* -------------------------------------------------------------------------- */
  async sendReport(userId: number, dto: LeaseReportDto) {
    await this.mailService.sendAdminLeaseReport(
      userId,
      dto.leaseId,
      dto.reason,
    );
  }
}
