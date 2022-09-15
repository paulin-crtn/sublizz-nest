import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailVerification, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private domain: string;

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {
    this.domain = this.configService.get('DOMAIN');
  }

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
    emailVerification: EmailVerification,
  ) {
    const url = `${this.domain}/auth/confirm-email?emailVerificationId=${emailVerification.id}&token=${token}`;
    await this.mailerService.sendMail({
      to: emailVerification.email,
      subject: 'Confirmez votre email pour valider votre inscription',
      template: './email-verification-token',
      context: {
        firstName: user.firstName,
        url,
      },
    });
  }

  /**
   * Send a reset password token to the user
   *
   * @param user
   * @param token
   */
  async sendUserResetPasswordToken(user: User, token: string) {
    const url = `${this.domain}/auth/reset-password?email=${user.email}&token=${token}`;
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
