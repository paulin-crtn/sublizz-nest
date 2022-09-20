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
import * as argon from 'argon2';
import { UpdateUserDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailVerificationService } from '../email-verification/email-verification.service';

/* -------------------------------------------------------------------------- */
/*                             USER SERVICE CLASS                             */
/* -------------------------------------------------------------------------- */
@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private emailVerificationService: EmailVerificationService,
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
      throw new NotFoundException('User not found.');
    }
    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException('Email must be verified.');
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
      throw new NotFoundException('User not found.');
    }
    if (user.id !== userId) {
      throw new ForbiddenException('Access to resource denied.');
    }

    // Data
    const { email, password, ...data } = dto;

    if (email && email !== user.email) {
      this.emailVerificationService.verifyUserEmail(user, email);
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
      throw new NotFoundException('User not found.');
    }
    if (user.id !== userId) {
      throw new ForbiddenException('Access to resource denied.');
    }
    await this.prismaService.user.delete({
      where: {
        id,
      },
    });
  }
}
