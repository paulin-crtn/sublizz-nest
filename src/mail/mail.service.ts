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
  async sendUserEmailVerificationToken(
    user: User,
    token: string,
    emailVerificationId: number,
  ) {
    const url = `${process.env.DOMAIN}/auth/confirm-email?emailVerificationId=${emailVerificationId}&token=${token}`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Confirmez votre email pour valider votre inscription',
      template: './email-verification-token',
      context: {
        firstName: user.firstName,
        url,
      },
    });
  }

  async sendUserResetPasswordToken(user: User, token: string) {
    const url = `${process.env.DOMAIN}/auth/reset-password?email=${user.email}&token=${token}`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Demande de changement de mot de passe',
      template: './password-reset-token',
      context: {
        firstName: user.firstName,
        url,
      },
    });
  }
}
