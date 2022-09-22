import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import argon from 'argon2';
import randomToken from 'rand-token';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

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
