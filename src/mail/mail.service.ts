import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailVerification, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private baseUrl: string;

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {
    // DO NOT SEND EMAIL WHEN RUNNING TEST
    if (this.configService.get('NODE_ENV') === 'test') {
      // Overide sendMail function
      mailerService.sendMail = ({}) => {
        return null;
      };
    }
    // SET BASE URL
    this.baseUrl =
      this.configService.get('APP_DOMAIN') +
      ':' +
      this.configService.get('APP_PORT');
  }

  /**
   * Send a confirmation email to the user
   *
   * @param user
   * @param token
   * @param emailVerification
   */
  async sendUserEmailVerificationToken(
    user: User,
    token: string,
    emailVerification: EmailVerification,
  ) {
    const url = `${this.baseUrl}/auth/confirm-email?emailVerificationId=${emailVerification.id}&token=${token}`;
    try {
      await this.mailerService.sendMail({
        to: emailVerification.email,
        subject: 'Confirmez votre email pour valider votre inscription',
        template: './email-verification-token',
        context: {
          firstName: user.firstName,
          url,
        },
      });
    } catch (e) {
      throw new Error(
        'An error occcured while sending user email verification token: ' + e,
      );
    }
  }

  /**
   * Send a reset password token to the user
   *
   * @param user
   * @param token
   */
  async sendUserResetPasswordToken(user: User, token: string) {
    const url = `${this.baseUrl}/auth/reset-password?email=${user.email}&token=${token}`;
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Demande de changement de mot de passe',
        template: './password-reset-token',
        context: {
          firstName: user.firstName,
          url,
        },
      });
    } catch (e) {
      throw new Error(
        'An error occcured while sending user reset password token: ' + e,
      );
    }
  }
}
