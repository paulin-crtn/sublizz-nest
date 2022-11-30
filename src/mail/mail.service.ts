import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailVerification, Lease, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private BACK_BASE_URL: string;
  private FRONT_URL: string;

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
    this.BACK_BASE_URL =
      this.configService.get('APP_DOMAIN') +
      ':' +
      this.configService.get('APP_PORT');
    // SET FRONT URL
    this.FRONT_URL = this.configService.get('FRONT_DOMAIN');
  }

  async sendUserEmailVerification(
    user: User,
    token: string,
    emailVerification: EmailVerification,
  ) {
    const url = `${this.FRONT_URL}/confirm-email?emailVerificationId=${emailVerification.id}&token=${token}`;
    try {
      await this.mailerService.sendMail({
        to: emailVerification.email,
        subject: 'Finalisez la création de votre compte',
        template: './email-verification',
        context: {
          firstName: user.firstName,
          url,
        },
      });
    } catch (e) {
      throw new Error(
        "Une erreur est survenue pendant l'envoi du token de vérification : " +
          e,
      );
    }
  }

  async sendUserResetPassword(user: User, token: string) {
    const url = `${this.FRONT_URL}/reset-password?email=${user.email}&token=${token}`;
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Demande de changement de mot de passe',
        template: './password-reset',
        context: { url },
      });
    } catch (e) {
      throw new Error(
        "Une erreur est survenue pendant l'envoi du token de réinitialisation : " +
          e,
      );
    }
  }

  async sendUserLeaseMessage(
    lease: Lease,
    fromUser: User,
    toUser: User,
    message: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: toUser.email,
        subject: `Nouveau message de ${fromUser.firstName}`,
        template: './lease-message',
        context: {
          mailto: 'mailto:' + fromUser.email,
          lease,
          fromUser,
          toUser,
          message,
        },
      });
    } catch (e) {
      throw new Error(
        "Une erreur est survenue pendant l'envoi du message : " + e,
      );
    }
  }

  async sendAdminLeaseReport(userId: number, leaseId: number, reason: string) {
    try {
      await this.mailerService.sendMail({
        to: 'contact@haftwald.com',
        subject: "Signalement d'une annonce",
        template: './lease-report',
        context: {
          userId,
          leaseId,
          reason,
        },
      });
    } catch (e) {
      throw new Error(
        "Une erreur est survenue pendant l'envoi du signalement : " + e,
      );
    }
  }

  async sendAdminHelpMessage(userId: number, message: string) {
    try {
      await this.mailerService.sendMail({
        to: 'contact@haftwald.com',
        subject: 'Un utilisateur vous a envoyé une suggestion',
        template: './help-us',
        context: {
          userId,
          message,
        },
      });
    } catch (e) {
      throw new Error(
        "Une erreur est survenue pendant l'envoi de la suggestion : " + e,
      );
    }
  }
}
