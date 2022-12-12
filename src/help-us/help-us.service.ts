/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

/* -------------------------------------------------------------------------- */
/*                               HELP US SERVICE                              */
/* -------------------------------------------------------------------------- */
@Injectable()
export class HelpUsService {
  constructor(private mailService: MailService) {}
  /* -------------------------------------------------------------------------- */
  /*                              PUBLIC FUNCTIONS                              */
  /* -------------------------------------------------------------------------- */
  async sendHelpMessage(userId: number, message: string) {
    await this.mailService.sendAdminHelpMessage(userId, message);
  }
}
