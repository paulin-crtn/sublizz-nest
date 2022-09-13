import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  /**
   * Send a confirmation email to the user
   *
   * @param user
   * @param token
   * @param emailVerificationId
   */
  async sendUserConfirmation(
    user: User,
    token: string,
    emailVerificationId: number,
  ) {
    const url = `${process.env.DOMAIN}/auth/confirm-user-email?emailVerificationId=${emailVerificationId}&token=${token}`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Veuillez confirmer votre email pour valider votre inscription',
      template: './confirmation',
      context: {
        firstName: user.firstName,
        url,
      },
    });
  }
}
