import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}
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
      throw new UnauthorizedException('Email does not exist.');
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
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
    if (!user || user.id !== userId) {
      throw new ForbiddenException('Access to resource denied.');
    }
    return await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        ...dto,
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
    if (!user || user.id !== userId) {
      throw new ForbiddenException('Access to resource denied.');
    }
    await this.prismaService.user.delete({
      where: {
        id,
      },
    });
  }
}
