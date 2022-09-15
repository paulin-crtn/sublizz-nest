import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import * as randomToken from 'rand-token';

@Injectable()
export class EmailVerificationService {
  constructor(
    private prismaService: PrismaService,
    private mailService: MailService,
  ) {}

  /**
   * Verify user email by generating, storing and sending
   * a token to the user by email
   *
   * @param user
   * @param email
   */
  async verifyUserEmail(user: User, email: string) {
    const token = randomToken.generate(16);
    const tokenHash = await argon.hash(token);
    const emailVerification = await this.prismaService.emailVerification.create(
      {
        data: {
          userId: user.id,
          email,
          tokenHash,
        },
      },
    );
    await this.mailService.sendUserEmailVerificationToken(
      user,
      token,
      emailVerification,
    );
  }
}
