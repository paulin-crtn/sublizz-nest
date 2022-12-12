/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import argon from 'argon2';
import randomToken from 'rand-token';
import { UpdateUserDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

/* -------------------------------------------------------------------------- */
/*                             USER SERVICE CLASS                             */
/* -------------------------------------------------------------------------- */
@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private mailService: MailService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                              PUBLIC FUNCTIONS                              */
  /* -------------------------------------------------------------------------- */
  /**
   * Get user by its email
   *
   * @param email
   * @returns
   */
  async getUserByEmail(email: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }
    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException("L'adresse email doit être vérifiée.");
    }
    return user;
  }

  /**
   * Update user
   *
   * @param id
   * @param userId
   * @param dto
   * @returns
   */
  async update(id: number, userId: number, dto: UpdateUserDto): Promise<User> {
    // Find user by id
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }
    if (user.id !== userId) {
      throw new ForbiddenException('Accès refusé.');
    }

    // Data
    const { email, password, ...data } = dto;

    if (email && email !== user.email) {
      await this.verifyUserEmail(user, email);
    }

    const passwordHash = password
      ? await argon.hash(password)
      : user.passwordHash;

    // Update user
    return await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        ...data,
        passwordHash,
      },
    });
  }

  /**
   * Delete user
   *
   * @param id
   * @param userId
   */
  async delete(id: number, userId: number): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }
    if (user.id !== userId) {
      throw new ForbiddenException('Accès refusé.');
    }
    await this.prismaService.user.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Generate and save a token (hashed) in DB
   * then send the token to the user by email
   *
   * @param user
   * @param email The email to verify
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
    await this.mailService.sendUserEmailVerification(
      user,
      token,
      emailVerification,
    );
  }
}
